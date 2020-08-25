import DiscordJS from "discord.js";

import Command from "../../command";
import { breeds, search } from "../dogapi";
import { paginateMessage } from "../../../util";

const PER_PAGE = Math.min(
    100,
    Math.max(20, Number(process.env.PER_PAGE || 20))
);

class DogWith extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!process.env.DOG_APIKEY)
            return message.reply("missing dog apikey :(");

        const categs: {
            id: number;
            name: string;
        }[] = await breeds();

        const breed = args.join(" ");
        if (!args[0] || categs.find((categ) => categ.name === breed)) {
            const categstostr = (page: number) =>
                "\n```nim\n" +
                (categs
                    .slice(page * PER_PAGE, (page + 1) * PER_PAGE)
                    .map((categ, i) => categ.name)
                    .join("\n") || "(no breeds)") +
                "```";

            let page = 0;

            const mess = await message.reply(categstostr(page));
            paginateMessage(mess, message.author.id, async (action) => {
                switch (action) {
                    case "UP":
                        if (page >= 1) page--;
                        break;
                    case "TOP":
                        page = 0;
                        break;
                    case "DOWN":
                        if ((page + 1) * PER_PAGE < categs.length) page++;
                        break;
                    case "BOTTOM":
                        page = ~~(categs.length / PER_PAGE) - 1;
                        break;
                }

                await mess.edit(categstostr(page));
            });

            return;
        }

        const dogs = await search({
            subid: message.author.id,
            category_ids:
                categs.find((c) => c.name === breed)?.id.toString() || "",
            limit: 1,
        });

        return message.reply("", { files: dogs.map((dog: any) => dog.url) });
    }
}

export default new DogWith(["dogwith", "dog with"]);
