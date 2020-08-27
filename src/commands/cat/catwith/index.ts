import DiscordJS from "discord.js";

import Command from "../../command";
import { categories, search } from "../catapi";

class CatWith extends Command {
    constructor() {
        super(["catwith", "cat with"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!process.env.CAT_APIKEY)
            return message.reply("missing cat apikey :(");

        const categs: {
            id: number;
            name: string;
        }[] = await categories();

        if (!args[0] || !args.every((a) => categs.some((c) => c.name === a)))
            return message.reply(categs.map((c) => c.name));

        const cats = (
            await Promise.all(
                args.map((a) =>
                    search({
                        subid: message.author.id,
                        category_ids:
                            categs.find((c) => c.name === a)?.id.toString() ||
                            "",
                        limit: 1,
                    })
                )
            )
        ).reduce((a, b) => [...a, ...b], []);

        return message.reply("", { files: cats.map((cat: any) => cat.url) });
    }
}

export default new CatWith();
