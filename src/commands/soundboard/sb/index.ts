import DiscordJS from "discord.js";

import { autodisconnect, playSound } from "../../../util";
import sbl from "../sbl";
import Command from "../../command";

class Soundboard extends Command {
  constructor() {
    super(["sb"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    if (!args[0]) return await sbl.execute(message, ...args);

    const channel = message.member?.voice.channel;
    const guildId = message.guild?.id;

    if (!channel || !guildId) return message.react("🔇");

    const connection = await channel.join();
    if (!connection) return message.react("🔇");
    autodisconnect(message);

    for (let sound of args.slice(0, 10)) {
      await playSound(guildId, sound, connection).catch((e) => {
        return message.reply(e.message);
      });
    }

    if (message.deleted) return;

    message.react("👍");
  }
}

export default new Soundboard();
