import DiscordJS from "discord.js";

import Manager from ".";

class Command {
    constructor(prefixes: string[]) {
        Manager.register(prefixes, this);
    }

    public async execute(
        message: DiscordJS.Message,
        ...args: string[]
    ): Promise<any> {
        throw new Error("Not implemented :(");
    }
}

export default Command;
