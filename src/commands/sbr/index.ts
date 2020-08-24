import DiscordJS from "discord.js";

import soundboard from "../../db/soundboard";
import Command from "../command";

class SoundboardRemove extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!args[0]) return message.reply("sbr key");

        const sb = await soundboard
            .findOne({
                gid: message.guild?.id,
                key: args[0],
            })
            .select("-val");

        if (!sb) return message.reply("sound not found");

        if (
            sb.uid !== message.author.id &&
            !message.guild
                ?.member(message.author)
                ?.roles.cache.map((r) => r.name)
                .includes("sudo-admin")
        ) {
            return message.reply("you do not own this sound");
        }

        await sb.remove();
        return message.react("👍");
    }
}

export default new SoundboardRemove(["sbr"]);
