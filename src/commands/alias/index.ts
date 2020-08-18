import DiscordJS from "discord.js";

import { commands } from "../";
import alias from "../../db/alias";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (args.length === 1) {
        const al = await alias.findOne({
            gid: message.guild?.id,
            key: args[0],
        });

        if (al) return message.reply(`${al.key} ${al.val}`);
        return message.reply("alias not found");
    } else if (args.length >= 2) {
        for (let command in commands) {
            if (command[0] === "_") command = command.slice(1);
            if (args[0] === command)
                return message.reply("command already exists");
        }

        const al = await alias.findOne({
            gid: message.guild?.id,
            key: args[0],
        });

        if (al && al.uid !== message.author.id)
            return message.reply("alias already exists");

        await new alias({
            gid: message.guild?.id,
            uid: message.author.id,
            key: args[0],
            val: args.slice(1).join(" "),
        }).save();

        return message.react("👍");
    }

    return message.reply("alias key values?");
};
