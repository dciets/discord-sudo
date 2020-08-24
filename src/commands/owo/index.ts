import DiscordJS from "discord.js";

import owoify from "owoify-js";

import Command from "../command";

class OwO extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        return message.reply(owoify(args.join(" "), "owo"));
    }
}

export default new OwO(["owo", "uwu"]);
