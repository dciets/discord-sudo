import DiscordJS from "discord.js";
import fetch from "node-fetch";

const catapi = (subid: string, catid: string, limit: number) =>
    fetch(
        `https://api.thecatapi.com/v1/images/search?mime_types=jpg,png&size=med&sub_id=${subid}&category_ids=${catid}&limit=${limit}`,
        {
            headers: { "X-API-KEY": process.env.CAT_APIKEY || "" },
        }
    ).then((r) => r.json());

const catcategories = () =>
    fetch(`https://api.thecatapi.com/v1/categories`, {
        headers: { "X-API-KEY": process.env.CAT_APIKEY || "" },
    }).then((r) => r.json());

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (!process.env.CAT_APIKEY) return message.reply("missing cat apikey :(");
    const categories: { id: number; name: string }[] = await catcategories();

    if (!args[0] || !args.every((a) => categories.some((c) => c.name === a)))
        return message.reply(categories.map((c) => c.name));

    const cats = (
        await Promise.all(
            args.map((a) =>
                catapi(
                    message.author.id,
                    categories.find((c) => c.name === a)?.id.toString() || "",
                    1
                )
            )
        )
    ).reduce((a, b) => [...a, ...b], []);

    return message.reply("", { files: cats.map((cat: any) => cat.url) });
};
