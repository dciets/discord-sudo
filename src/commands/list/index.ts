import DiscordJS from "discord.js";

import { commands } from "../";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    const cmds = [];
    for (let command in commands)
        cmds.push(command[0] === "_" ? command.slice(1) : command);
    return message.reply(`\`\`\`\n${cmds.join("\n")}\`\`\``);
};
