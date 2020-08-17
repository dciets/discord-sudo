import DiscordJS from "discord.js";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    return message.reply(`ping! +${Date.now() - message.createdTimestamp}ms`);
};
