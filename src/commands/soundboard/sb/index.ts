import DiscordJS from "discord.js";
import { Readable } from "stream";

import { waitFor, autodisconnect } from "../../../util";
import soundboard from "../../../db/soundboard";
import sbl from "../sbl";
import Command from "../../command";

class Soundboard extends Command {
    constructor() {
        super(["sb"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!args[0]) return await sbl.execute(message, ...args);

        if (!message.member?.voice.channel) return message.react("🔇");
        const channel = message.member?.voice.channel;

        for (let arg of args.slice(0, 10)) {
            const file = await soundboard.findOne({
                gid: message.guild?.id,
                key: arg,
            });

            if (!file) return message.reply("sound not found");

            const readable = new Readable({
                read() {
                    this.push(file.val);
                    this.push(null);
                },
            });

            const connection = await channel.join();
            if (!connection) return message.react("🔇");
            autodisconnect(message);
            const dispatcher = connection.play(readable);

            await waitFor(dispatcher, "finish");

            dispatcher.end();
            readable.destroy();
        }

        return message.react("👍");
    }
}

export default new Soundboard();
