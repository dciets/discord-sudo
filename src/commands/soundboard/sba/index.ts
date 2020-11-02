import DiscordJS from "discord.js";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";

import soundboard from "../../../db/soundboard";

import { waitFor, autodisconnect, ffmpegSpawner } from "../../../util";
import Command from "../../command";

class SoundboardAdd extends Command {
    constructor() {
        super(["sba"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!args[0] || !args[1]) return message.reply("sba key [me|here|url]");

        const sb = await soundboard
            .findOne({
                gid: message.guild?.id,
                key: args[0],
            })
            .select("-val");

        if (sb) return message.reply("sound already exists");

        if (args[1] === "me") {
            if (!message.member?.voice.channel) return message.react("🔇");

            const connection = await message.member.voice.channel.join();
            if (!connection) return message.react("🔇");
            autodisconnect(message);
            await waitFor(
                connection.play("./assets/audio/silence.mp3"),
                "finish"
            );

            const recorder = connection.receiver.createStream(message.author, {
                mode: "pcm",
            });

            const ffmpeg = ffmpegSpawner(
                {
                    ar: 48000,
                    ac: 2,
                    informat: "s16le",
                    timelength: 10,
                    input: "pipe:0",
                    outformat: "mp3",
                    output: "pipe:1",
                },
                { stdin: "pipe", stdout: "pipe" }
            );

            if (!ffmpeg.stdout || !ffmpeg.stdin)
                throw new Error("missing stds");

            const bufs: Buffer[] = [];
            ffmpeg.stdout.on("data", (buf) => bufs.push(buf));

            recorder.pipe(ffmpeg.stdin);

            if ((await waitFor(ffmpeg, "exit")) !== 0)
                return message.react("❌");
            const buf: Buffer = Buffer.concat(bufs);

            if (buf.length === 0) return message.react("👎");

            await new soundboard({
                gid: message.guild?.id,
                uid: message.author.id,
                key: args[0],
                val: buf,
            }).save();

            return message.react("👍");
        } else if (args[1] === "here") {
            if (!message.member?.voice.channel) return message.reply("🔇");

            const connection = await message.member.voice.channel.join();
            if (!connection) return message.reply("🔇");
            await waitFor(
                connection.play("./assets/audio/silence.mp3"),
                "finish"
            );

            const recorders: Promise<
                string
            >[] = message.member.voice.channel.members.map((m) => {
                if (m.id === m.client.user?.id) return Promise.resolve("");
                return waitFor(
                    connection.receiver
                        .createStream(m, {
                            mode: "pcm",
                        })
                        .pipe(fs.createWriteStream("tmp/" + m.id)),
                    "finish"
                ).then(() => path.resolve("tmp/" + m.id));
            });

            const ids: string[] = (await Promise.all(recorders)).filter(
                (s) => !!s
            );

            const ffmpeg = ffmpegSpawner(
                {
                    ar: 48000,
                    ac: 2,
                    informat: "s16le",
                    timelength: 10,
                    input: ids,
                    outformat: "mp3",
                    output: "pipe:1",
                },
                { stdin: "ignore", stdout: "pipe" }
            );

            if (!ffmpeg.stdout || !ffmpeg.stdin)
                throw new Error("missing stds");

            const bufs: Buffer[] = [];
            ffmpeg.stdout.on("data", (buf) => bufs.push(buf));

            const ecode = await waitFor(ffmpeg, "exit");
            await Promise.all(ids.map((id) => fs.promises.unlink(id)));

            if (ecode !== 0) return message.react("❌");
            const buf: Buffer = Buffer.concat(bufs);

            if (buf.length === 0) return message.react("👎");

            await new soundboard({
                gid: message.guild?.id,
                uid: message.author.id,
                key: args[0],
                val: buf,
            }).save();

            return message.react("👍");
        } else {
            const stream = await fetch(args[1], {
                headers: {
                    "User-Agent": "sudo",
                },
                timeout: 5000,
            }).then((r) => r.body);

            const ffmpeg = ffmpegSpawner(
                {
                    input: "pipe:0",
                    timelength: 10,
                    outformat: "mp3",
                    output: "pipe:1",
                },
                { stdin: "pipe", stdout: "pipe" }
            );

            if (!ffmpeg.stdout || !ffmpeg.stdin)
                throw new Error("missing stds");

            stream.pipe(ffmpeg.stdin).once("error", console.error);

            const bufs: Buffer[] = [];
            ffmpeg.stdout.on("data", (b) => bufs.push(b));

            if ((await waitFor(ffmpeg, "exit")) !== 0)
                return message.react("❌");
            const buf: Buffer = Buffer.concat(bufs);

            if (buf.length === 0) return message.react("👎");

            await new soundboard({
                gid: message.guild?.id,
                uid: message.author.id,
                key: args[0],
                val: buf,
            }).save();

            return message.react("👍");
        }
    }
}

export default new SoundboardAdd();
