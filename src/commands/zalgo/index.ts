import DiscordJS from "discord.js";
import Command from "../command";

import { dontDoIt } from "./summon";

class Zalgo extends Command {
    constructor() {
        super(["zalgo", "cursed"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (args.length > 0) return message.reply(dontDoIt(args.join(" "), 10));
        return message.reply(dontDoIt("       REACH INTO THE VOID       ", 10));
    }
}

export default new Zalgo();
