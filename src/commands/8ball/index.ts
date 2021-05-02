import DiscordJS from "discord.js";
import { __ } from "i18n";

import Command from "../command";
import random from "../random";

class _8ball extends Command {
  constructor() {
    super(["8ball", "8b"]);
  }

  public execute(message: DiscordJS.Message, ...args: string[]) {
    return message.reply(random.pick(__("8ball") as any) + " :8ball:");
  }
}

export default new _8ball();
