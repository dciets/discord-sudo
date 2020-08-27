import DiscordJS from "discord.js";
import { __ } from "i18n";
import fetch from "node-fetch";

import random from "../random";
import Command from "../command";

const fetchXKCD = async (n?: any) => {
    if ([undefined, "latest"].includes(n)) {
        n = "";
    }

    return await fetch(`https://xkcd.com/${n}/info.0.json`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    }).then((r) => r.json());
};

class XKCD extends Command {
    constructor() {
        super(["xkcd"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        let post = null;

        if (args[0] === "random") {
            const latestPost = await fetchXKCD("latest");
            const n = random.range(1, latestPost?.num);

            post = await fetchXKCD(n);
        } else if (args[0] && /\d+/.test(args[0])) {
            post = await fetchXKCD(args[0]);
        } else if (args.length === 0) {
            post = await fetchXKCD("latest");
        }

        if (post) {
            return message.reply(post.title, {
                files: [post.img],
            });
        }

        return message.reply("xkcd (random|\\d+)?");
    }
}

export default new XKCD();
