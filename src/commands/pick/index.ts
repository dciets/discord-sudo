import DiscordJS from "discord.js";

import random from "../random";
import Command from "../command";

class Pick extends Command {
  constructor() {
    super(["pick"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    if (args.length === 0) return message.reply(`pick [one or more items]`);
    return message.reply(random.pick(args));
  }
}

export default new Pick();
