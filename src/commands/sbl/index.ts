import DiscordJS from "discord.js";

import soundboard from "../../db/soundboard";
import { paginateMessage } from "../../util";

const PER_PAGE = Math.min(
    100,
    Math.max(20, Number(process.env.PER_PAGE || 20))
);

export default async (message: DiscordJS.Message, ...args: string[]) => {
    const sbs = await soundboard
        .find({ gid: message.guild?.id })
        .select("-val")
        .sort("key");

    const max_nb = sbs.length.toString().length;
    const sbstostr = (page: number) =>
        "\n```nim\n" +
        (sbs
            .slice(page * PER_PAGE, (page + 1) * PER_PAGE)
            .map((sb, i) => {
                const user = message.guild?.members.cache.get(sb.uid);
                const str = `(${(page * PER_PAGE + i + 1)
                    .toString()
                    .padStart(max_nb, "0")} ${sb.key} by `;
                if (!user) return str + `unknown`;
                return str + (user.nickname || user.user.username);
            })
            .join("\n") || "(no soundboards added)") +
        "```";

    const mess = await message.channel.send(sbstostr(0));

    if (sbs.length > PER_PAGE) {
        let page = 0;

        // dont await to free the lock
        paginateMessage(mess, message.author.id, async (action) => {
            switch (action) {
                case "UP":
                    if (page >= 1) page--;
                    break;
                case "TOP":
                    page = 0;
                    break;
                case "DOWN":
                    if ((page + 1) * PER_PAGE < sbs.length) page++;
                    break;
                case "BOTTOM":
                    page = ~~(sbs.length / PER_PAGE) - 1;
                    break;
            }

            await mess.edit(sbstostr(page));
        });
    }

    return;
};
