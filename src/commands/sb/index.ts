import DiscordJS from "discord.js";
import { Readable } from "stream";

import { waitFor } from "../../util";
import soundboard from "../../db/soundboard";
import sbl from "../sbl";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (!args[0]) return await sbl(message, ...args);

    if (!message.member?.voice.channel) return message.reply("🔇");

    const file = await soundboard.findOne({
        gid: message.guild?.id,
        key: args[0],
    });

    if (!file) return message.reply("sound not found");

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
};
