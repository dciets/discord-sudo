import DiscordJS from "discord.js";

import Manager from ".";

class Command {
    constructor(prefixes: string[]) {
        Manager.register(prefixes, this);
    }

    public execute(message: DiscordJS.Message, ...args: string[]) {
        throw new Error("Not implemented :(");
    }
}

export default Command;
