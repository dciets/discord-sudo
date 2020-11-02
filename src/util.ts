import DiscordJS, { VoiceConnection } from "discord.js";
import { Readable, Stream, Writable } from "stream";
import { ChildProcessByStdio, spawn } from "child_process";
import ffmpeg_static from "ffmpeg-static";

import soundboard from "./db/soundboard";

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = (
    stream: { once: (event: string, ...args: any[]) => any },
    event: string
) => new Promise((resolve) => stream.once(event, resolve));

export const htmldecode = (() => {
    const htmlentities: any = {
        nbsp: " ",
        cent: "¢",
        pound: "£",
        yen: "¥",
        euro: "€",
        copy: "©",
        reg: "®",
        lt: "<",
        gt: ">",
        quot: '"',
        amp: "&",
        apos: "'",
    };

    return (str: string) =>
        str.replace(/&(.+?);/g, (substr: string, ...args: string[]) => {
            if (htmlentities[args[0]]) return htmlentities[args[0]];
            else if (args[0].indexOf("#x") === 0)
                return String.fromCharCode(
                    parseInt(args[0].substr(2), 16) || 63
                );
            else if (args[0].indexOf("#") === 0)
                return String.fromCharCode(parseInt(args[0].substr(1)) || 63);
            else return substr;
        });
})();

export const lock = (() => {
    const locks: { [key: string]: number[] } = {};

    return {
        wait: async (gid: string) => {
            if (!locks[gid]) locks[gid] = [];
            const key = Date.now();
            locks[gid].push(key);

            while (locks[gid][0] !== key) await sleep(100);
        },
        free: (gid: string) => {
            if (!locks[gid]) throw new Error("uhhh?");
            locks[gid].shift();
        },
    };
})();

export const paginateMessage = async (
    message: DiscordJS.Message,
    userid: string,
    onreact: (action: "UP" | "TOP" | "DOWN" | "BOTTOM") => Promise<void>
) => {
    await message.react("⬆️");
    await message.react("⏫");
    await message.react("⬇️");
    await message.react("⏬");

    try {
        while (true) {
            const collected = await message.awaitReactions(
                (reaction: DiscordJS.MessageReaction, user: DiscordJS.User) =>
                    ["⬆️", "⬇️", "⏬", "⏫"].includes(reaction.emoji.name) &&
                    user.id === userid,
                {
                    max: 1,
                    time: 60000,
                    errors: ["time"],
                }
            );

            const first = collected.first();
            if (!first) continue;

            switch (first.emoji.name) {
                case "⬆️":
                    await onreact("UP");
                    break;
                case "⏫":
                    await onreact("TOP");
                    break;
                case "⬇️":
                    await onreact("DOWN");
                    break;
                case "⏬":
                    await onreact("BOTTOM");
                    break;
            }

            await first.users.remove(userid);
        }
    } catch (e) {}
};

export const autodisconnect = (() => {
    const timeout = Number(process.env.AUTO_DISCONNECT || "300000");
    const locks: { [key: string]: NodeJS.Timeout } = {};

    return (message: DiscordJS.Message) => {
        const disconnect = async () => {
            if (message.guild?.me?.voice) {
                const voiceConnection = message.guild?.me?.voice?.connection;
                if (voiceConnection)
                    await playSound(
                        message.guild?.id,
                        "salutla",
                        voiceConnection
                    ).catch((e) => {});
                message.guild?.me.voice.channel?.leave();
            }
        };

        if (!message.guild) return;
        if (!locks[message.guild.id])
            locks[message.guild.id] = setTimeout(disconnect, timeout);
        else {
            clearTimeout(locks[message.guild.id]);
            locks[message.guild.id] = setTimeout(disconnect, timeout);
        }
    };
})();

export const playSound = async (
    gid: string,
    sound: string,
    connection: VoiceConnection
) => {
    const file = await soundboard.findOne({ gid, key: sound });

    if (!file) throw new Error("sound not found");

    const readable = new Readable({
        read() {
            this.push(file.val);
            this.push(null);
        },
    });

    const dispatcher = connection.play(readable);

    await waitFor(dispatcher, "finish");

    dispatcher.end();
    readable.destroy();
};

export const ffmpegSpawner = (
    params: {
        ar?: number;
        ac?: number;
        timelength?: number;
        informat?: string;
        input: string | string[];
        outformat?: string;
        output: string;
    },
    pipes: {
        stdin:
            | number
            | Stream
            | "pipe"
            | "inherit"
            | "ignore"
            | "ipc"
            | null
            | undefined;
        stdout:
            | number
            | Stream
            | "pipe"
            | "inherit"
            | "ignore"
            | "ipc"
            | null
            | undefined;
    }
) => {
    const args = [
        "-vn", // cut video
        ...(params.ar ? ["-ar", params.ar + ""] : []),
        ...(params.ac ? ["-ac", params.ac + ""] : []),
        ...(params.informat ? ["-f", params.informat] : []),
        ...(params.timelength ? ["-t", params.timelength + ""] : []),
        ...(typeof params.input === "string"
            ? ["-i", params.input || "pipe:0"]
            : params.input.length === 0
            ? ["-i", "pipe:0"]
            : params.input.reduce(
                  (acc: string[], input) => [...acc, "-i", input],
                  []
              )),
        ...(params.outformat ? ["-f", params.outformat] : []),
        params.output || "pipe:1",
    ].filter((x) => !!x);

    return spawn(ffmpeg_static, args, {
        stdio: [
            pipes.stdin,
            pipes.stdout,
            process.env.NODE_ENV !== "production" ? "inherit" : "ignore",
        ],
        cwd: ".",
    });
};
