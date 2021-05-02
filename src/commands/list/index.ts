import DiscordJS from "discord.js";

import manager from "..";
import Command from "../command";

class List extends Command {
  constructor() {
    super(["list"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    const cmdset = new Set();
    const cmds = [];

    for (let cmdname in manager.commands) {
      if (!cmdset.has(manager.commands[cmdname])) {
        cmds.push(cmdname);
        cmdset.add(manager.commands[cmdname]);
      }
    }

    return message.reply(`\`\`\`\n${cmds.join("\n")}\`\`\``);
  }
}

export default new List();
