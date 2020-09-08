import DiscordJS from "discord.js";
import gTTS from "gtts";
import fs from "fs";

import Command from "../command";
import { autodisconnect, waitFor } from "../../util";

class Ping extends Command {
    constructor() {
        super(["tts"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        const channel = message.member?.voice.channel;
        const guildId = message.guild?.id;

        if (!channel || !guildId) return message.react("🔇");

        const connection = await channel.join();
        if (!connection) return message.react("🔇");
        autodisconnect(message);

        const gtts = new gTTS(args.join(" "), "en");
        const filename = "./tmp/" + Date.now() + ".mp3";
        await new Promise((resolve, reject) =>
            gtts.save(filename, (err: Error, result: any) =>
                err ? reject(err) : resolve(result)
            )
        );

        const stream = fs.createReadStream(filename);
        const dispatch = connection.play(stream);

        let timeout = setTimeout(() => dispatch.end(), 10000);
        await waitFor(dispatch, "finish");
        clearTimeout(timeout);

        await fs.promises.unlink(filename);

        return message.react("👍");
    }
}

export default new Ping();
