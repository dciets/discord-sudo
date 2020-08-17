import DiscordJS from "discord.js";

import random from "../random";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (args.length === 0) return message.reply(`pick [one or more items]`);
    return message.reply(random.pick(args));
};
