import DiscordJS from "discord.js";

import Command from "../command";

class Ping extends Command {
    constructor() {
        super(["ping"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        return message.reply(
            `pong! +${Date.now() - message.createdTimestamp}ms`
        );
    }
}

export default new Ping();
