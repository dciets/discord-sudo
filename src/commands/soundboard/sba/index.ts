import DiscordJS from "discord.js";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import ffmpeg_static from "ffmpeg-static";

import soundboard from "../../../db/soundboard";

import { waitFor, autodisconnect } from "../../../util";
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

            const ffmpeg = spawn(
                ffmpeg_static,
                [
                    "-ar",
                    "48000",
                    "-ac",
                    "2",
                    "-f",
                    "s16le",
                    "-t",
                    "10",
                    "-i",
                    "pipe:0",
                    "-f",
                    "mp3",
                    "pipe:1",
                ],
                {
                    stdio: [
                        "pipe",
                        "pipe",
                        process.env.NODE_ENV !== "production"
                            ? "inherit"
                            : "ignore",
                    ],
                }
            );

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

            const ffmpeg = spawn(
                ffmpeg_static,
                [
                    "-ar",
                    "48000",
                    "-ac",
                    "2",
                    "-f",
                    "s16le",
                    "-t",
                    "10",
                    ...ids.reduce((a: string[], b) => {
                        a.push("-i", b);
                        return a;
                    }, []),
                    "-f",
                    "mp3",
                    "pipe:1",
                ],
                {
                    stdio: [
                        "ignore",
                        "pipe",
                        process.env.NODE_ENV !== "production"
                            ? "inherit"
                            : "ignore",
                    ],
                    cwd: ".",
                }
            );

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

            const ffmpeg = spawn(
                ffmpeg_static,
                [
                    "-i",
                    "pipe:0",
                    "-codec:a",
                    "libmp3lame",
                    "-qscale:a",
                    "2",
                    "-f",
                    "mp3",
                    "-t",
                    "10",
                    "pipe:1",
                ],
                {
                    stdio: [
                        "pipe",
                        "pipe",
                        process.env.NODE_ENV !== "production"
                            ? "inherit"
                            : "ignore",
                    ],
                }
            );

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
