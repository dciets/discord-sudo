import DiscordJS from "discord.js";

import intro from "../../db/intro";
import soundboard from "../../db/soundboard";
import Command from "../command";

/**
 * Command to add a sound to play when a user connects
 * to a voice channel. The sound needs to exist (added with sudo sba). You can only add intro sounds for yourself.
 */
class IntroSound extends Command {
    constructor() {
        super(["intro"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!args[0]) return message.reply("sudo intro soundKey OR sudo intro remove");

        if (args[0] === "remove") {
            await intro.deleteMany({
                gid: message.guild?.id,
                uid: message.member?.id,
            })
            return message.react("🗑️");
        }

        const soundKey = await soundboard
            .findOne({
                gid: message.guild?.id,
                key: args[0],
            })
            .select("-val");

        if (!soundKey) return message.reply("Sound does not exist.");

        await new intro({
            gid: message.guild?.id,
            uid: message.author.id,
            key: args[0]
        }).save();

        return message.react("👍");
    }
}

export default new IntroSound();
