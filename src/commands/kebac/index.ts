import DiscordJS from "discord.js";
import { __ } from "i18n";
import fetch from "node-fetch";

import Command from "../command";

class Kebac extends Command {
  constructor() {
    super(["kebac"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    if (args.length > 0) {
      const qs = `french=${encodeURIComponent(args.join(" "))}`;
      const response = await fetch(
        `https://agile-scrubland-53958.herokuapp.com?${qs}`
      ).then((r) => r.text());

      return message.reply(response);
    }

    return message.reply("kebac [\\w\\ ]+");
  }
}

export default new Kebac();
