import DiscordJS from "discord.js";
import fetch from "node-fetch";

import Command from "../command";

const catapi = (subid: string, catid: string, limit: number) =>
    fetch(
        `https://api.thecatapi.com/v1/images/search?mime_types=jpg,png&size=med&sub_id=${subid}&category_ids=${catid}&limit=${limit}`,
        {
            headers: { "X-API-KEY": process.env.CAT_APIKEY || "" },
        }
    ).then((r) => r.json());

class CatBomb extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!process.env.CAT_APIKEY)
            return message.reply("missing cat apikey :(");

        const cats = await catapi(message.author.id.toString(), "", 10);
        return message.reply("", { files: cats.map((cat: any) => cat.url) });
    }
}

export default new CatBomb(["catbomb", "cat bomb"]);
