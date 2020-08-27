import DiscordJS from "discord.js";

import Command from "../command";

class GitHub extends Command {
    constructor() {
        super(["github", "git"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        return message.reply(`https://github.com/dciets/discord-sudo`);
    }
}

export default new GitHub();
