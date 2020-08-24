import DiscordJS from "discord.js";
import { __mf } from "i18n";

import random from "../random";
import Command from "../command";

class SurUn extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (args.length > 1 && /^\d+$/.test(args[0])) {
            const r = random.range(1, Number(args[0]));
            await message.reply(__mf("rolled a %s", r.toString()));
            return message.reply(
                r === Number(args[0]) ? `${args.slice(1).join(" ")}` : ":sob:"
            );
        }

        return message.reply("surun \\d+ .+");
    }
}

export default new SurUn(["surun", "sur un"]);
