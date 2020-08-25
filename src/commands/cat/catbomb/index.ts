import DiscordJS from "discord.js";

import Command from "../../command";
import { search } from "../catapi";

class CatBomb extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!process.env.CAT_APIKEY)
            return message.reply("missing cat apikey :(");

        const cats = await search({
            subid: message.author.id.toString(),
            limit: 10,
        });
        return message.reply("", { files: cats.map((cat: any) => cat.url) });
    }
}

export default new CatBomb(["catbomb", "cat bomb"]);
