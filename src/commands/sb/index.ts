import DiscordJS from "discord.js";
import fetch from "node-fetch";
import fs from "fs";
import AudioMixer from "audio-mixer";

const exists = async (path: string) => {
    try {
        await fs.promises.access(path);
        return true;
    } catch (e) {
        return false;
    }
};

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (!message.member?.voice.channel) return message.reply("🔇");

    if (/^[A-z0-9]+$/.test(args[0])) {
        if (args.length === 1) {
            const path = `./assets/audio/${args[0]}.mp3`;
            if (!(await exists(path))) return message.reply("file not found");

            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(path);

            return new Promise((resolve) =>
                dispatcher.on("finish", () => {
                    message.member?.voice.channel?.leave();
                    dispatcher.end();

                    resolve();
                })
            );
        } else if (args.length === 2) {
            const path = `./assets/audio/${args[0]}.mp3`;
            if (await exists(path)) return message.reply("file already exists");

            if (args[1] === "me") {
                const connection = await message.member.voice.channel.join();
                const recorder = connection.receiver.createStream(
                    message.author,
                    { mode: "pcm" }
                );

                return new Promise((resolve) =>
                    recorder
                        .pipe(fs.createWriteStream(path))
                        .on("close", resolve)
                ).then(() => message.reply("saved!"));
            } else if (args[1] === "here") {
                const mixer = new AudioMixer.Mixer({
                    channels: 2,
                    bitDepth: 16,
                    sampleRate: 48000,
                });

                const connection = await message.member.voice.channel.join();
                const recorders = message.member.voice.channel.members.map(
                    (member) => {
                        const stream = connection.receiver.createStream(
                            member,
                            {
                                mode: "pcm",
                            }
                        );

                        const input = new AudioMixer.Input({
                            channels: 2,
                            bitDepth: 16,
                            sampleRate: 48000,
                        });

                        mixer.addInput(input);
                        stream.pipe(input);

                        return new Promise((resolve) =>
                            stream.on("close", resolve)
                        );
                    }
                );

                return Promise.all(recorders).then(() =>
                    message.reply("saved!")
                );
            } else {
                const stream = await fetch(args[1], {
                    headers: {
                        "User-Agent": "sudo",
                    },
                }).then((r) => {
                    if (
                        /^audio\/(x-)?mpeg3?(-3)?/.test(
                            r.headers.get("Content-Type") || ""
                        )
                    )
                        return r.body.pipe(fs.createWriteStream(path));
                    return null;
                });

                if (!stream) return message.reply("file is not audio");

                return new Promise((resolve) =>
                    stream.on("close", resolve)
                ).then(() => message.reply("saved!"));
            }
        }
    }

    return message.reply("sb key [value|me|all]?");
};
