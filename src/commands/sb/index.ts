import DiscordJS from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import ffmpeg_static from "ffmpeg-static";
import { spawn } from "child_process";
import { Readable } from "stream";

import { waitFor, paginateMessage } from "../../util";
import soundboard from "../../db/soundboard";

const PER_PAGE = Math.min(
    100,
    Math.max(20, Number(process.env.PER_PAGE || 20))
);

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (/^[A-z0-9]+$/.test(args[0])) {
        if (args.length === 1) {
            if (!message.member?.voice.channel) return message.reply("🔇");

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

            if (file && file.uid !== message.author.id)
                return message.reply("file already exists");

            if (args[1] === "me") {
                if (!message.member?.voice.channel) return message.reply("🔇");

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

                if (file) await file.remove();
                await new soundboard({
                    gid: message.guild?.id,
                    uid: message.author.id,
                    key: args[0],
                    val: buf,
                }).save();

                await message.member?.voice.channel?.leave();

                return message.react("👍");
            } else if (args[1] === "here") {
                if (!message.member?.voice.channel) return message.reply("🔇");

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

                if (file) await file.remove();
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

                if (file) await file.remove();
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

    if (args.length === 0) {
        const sbs = await soundboard.find({ gid: message.guild?.id });

        const max_nb = sbs.length.toString().length;
        const sbstostr = (page: number) =>
            Date.now() +
            "\n```nim\n" +
            (sbs
                .slice(page * PER_PAGE, (page + 1) * PER_PAGE)
                .map((sb, i) => {
                    const user = message.guild?.members.cache.get(sb.uid);
                    const str = `(${(page * PER_PAGE + i + 1)
                        .toString()
                        .padStart(max_nb, "0")} ${sb.key} by `;
                    if (!user) return str + `unknown`;
                    return str + (user.nickname || user.user.username);
                })
                .join("\n") || "(no soundboards added)") +
            "```";

        const mess = await message.channel.send(sbstostr(0));

        if (sbs.length > PER_PAGE) {
            // dont await to free the lock

            let page = 0;
            paginateMessage(mess, message.author.id, async (action) => {
                switch (action) {
                    case "UP":
                        if (page >= 1) page--;
                        break;
                    case "TOP":
                        page = 0;
                        break;
                    case "DOWN":
                        if ((page + 1) * PER_PAGE < sbs.length) page++;
                        break;
                    case "BOTTOM":
                        page = ~~(sbs.length / PER_PAGE) - 1;
                        break;
                }

                await mess.edit(sbstostr(page));
            });
        }

        return;
    }

    return message.reply("sb key [value|me|here]?");
};
