import DiscordJS from "discord.js";

import Command from "../command";

class GitHub extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        return message.reply(`https://github.com/dciets/discord-sudo`);
    }
}

export default new GitHub(["github", "git"]);
