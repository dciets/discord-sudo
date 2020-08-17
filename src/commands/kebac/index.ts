import DiscordJS from "discord.js";
import { __ } from "i18n";
import fetch from "node-fetch";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (args.length > 0) {
        const qs = `french=${encodeURIComponent(args.join(" "))}`
        const response = await fetch(`https://agile-scrubland-53958.herokuapp.com?${qs}`).then((r) => r.text());

        return message.reply(response);
    }

    return message.reply("kebac [\\w\\ ]+");
};
