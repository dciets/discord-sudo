import DiscordJS from "discord.js";
import fetch from "node-fetch";

import { htmldecode } from "../../util";

const icndb = (nb: number) =>
    fetch(`https://api.icndb.com/jokes/${nb === -1 ? "random" : nb}`)
        .then((r) => r.json())
        .then((json) => json?.value?.joke)
        .then((joke) => (joke ? htmldecode(joke) : null));

export default async (message: DiscordJS.Message, ...args: string[]) => {
    return message.reply(
        (await icndb(!isNaN(+args[0]) ? Number(args[0]) : -1)) || "not found"
    );
};
