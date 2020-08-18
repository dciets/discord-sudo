import DiscordJS from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import ffmpeg_static from "ffmpeg-static";
import { spawn } from "child_process";
import { Readable } from "stream";

import { waitFor } from "../../util";
import soundboard from "../../db/soundboard";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (!message.member?.voice.channel) return message.reply("🔇");

    if (/^[A-z0-9]+$/.test(args[0])) {
        if (args.length === 1) {
            const file = await soundboard.findOne({
                gid: message.guild?.id,
                key: args[0],
            });

            if (!file) return message.reply("file not found");

            const readable = new Readable({
                read() {
                    this.push(file.val);
                    this.push(null);
                },
            });

            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(readable);

            await waitFor(dispatcher, "finish");

            message.member?.voice.channel?.leave();
            dispatcher.end();
            readable.destroy();

            return message.react("👍");
        } else if (args.length === 2) {
            const file = await soundboard.findOne({
                gid: message.guild?.id,
                key: args[0],
            });

            if (file) return message.reply("file already exists");

            if (args[1] === "me") {
                const connection = await message.member.voice.channel.join();
                if (!connection) return message.reply("🔇");

                const recorder = connection.receiver.createStream(
                    message.author,
                    { mode: "pcm" }
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
                        "-i",
                        "-",
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

                await message.member?.voice.channel?.leave();

                return message.react("👍");
            } else if (args[1] === "here") {
                const connection = await message.member.voice.channel.join();
                if (!connection) return message.reply("🔇");
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

                await message.member?.voice.channel?.leave();

                return message.react("👍");
            } else {
                const stream = await fetch(args[1], {
                    headers: {
                        "User-Agent": "sudo",
                    },
                }).then((r) => r.body);

                const ffmpeg = spawn(
                    ffmpeg_static,
                    [
                        "-i",
                        "-",
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

                stream.pipe(ffmpeg.stdin);

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

    return message.reply("sb key [value|me|all]?");
};
