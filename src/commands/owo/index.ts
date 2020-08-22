import DiscordJS from "discord.js";

import owo from "@zuzak/owo";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    return message.reply(owo(args.join(" ")));
};
