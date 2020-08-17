import DiscordJS from "discord.js";
import { __ } from "i18n";

import random from "../random";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    return message.reply(random.pick(__("8ball") as any) + " :8ball:");
};
