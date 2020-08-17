import DiscordJS from "discord.js";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    return message.reply(`pong! +${Date.now() - message.createdTimestamp}ms`);
};
