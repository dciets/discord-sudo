import DiscordJS from "discord.js";

import owoify from "owoify-js";

import Command from "../command";

class OwO extends Command {
  constructor() {
    super(["owo", "uwu"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    return message.reply((owoify as any).default(args.join(" "), "owo"));
  }
}

export default new OwO();
