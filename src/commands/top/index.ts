import DiscordJS from "discord.js";
import fetch from "node-fetch";
import { __ } from "i18n";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (args[0] && /^[A-z0-9]+/.test(args[0])) {
        const subreddit = await fetch(
            `https://www.reddit.com/r/${args[0]}/about.json`,
            {
                method: "GET",
                headers: {
                    "User-Agent": "sudo",
                    Accept: "application/json",
                },
            }
        )
            .then((r) => r.json())
            .then((json) => json?.data);

        const toppost = await fetch(
            `https://www.reddit.com/r/${args[0]}/top.json?count=1`,
            {
                method: "GET",
                headers: {
                    "User-Agent": "sudo",
                    Accept: "application/json",
                },
            }
        )
            .then((r) => r.json())
            .then(
                (json) =>
                    json.data?.children.sort(
                        (a: any, b: any) => b.data.score - a.data.score
                    )[0]?.data
            );

        if (!toppost)
            return message.reply(__("Subreddit not found or private"));

        if (
            (subreddit?.over18 || toppost.over_18) &&
            !(message.channel as DiscordJS.TextChannel).nsfw
        )
            return message.reply(__("I can't post that here :flushed:"));

        // i don't really know how to handle reddit's api
        if (toppost.selftext) {
            // assume text?
            if (toppost.selftext.length > 1900)
                return message.reply(`${toppost.title}\n${toppost.url}`);

            return message
                .reply(`${toppost.title}\n\`\`\`${toppost.selftext}\`\`\``)
                .catch(() => message.reply(`${toppost.title}\n${toppost.url}`));
        } else if (toppost.is_video) {
            // is a video
            const url = toppost.media?.reddit_video?.fallback_url;
            if (!url) return message.reply(`${toppost.title}\n${toppost.url}`);

            return message
                .reply(toppost.title, {
                    files: [url],
                })
                .catch(() => message.reply(`${toppost.title}\n${toppost.url}`));
        } else {
            // its an image?
            let url = toppost.url;
            if (/^https:\/\/(i\.)?imgur\.com/.test(url)) {
                if (/\.gifv$/.test(url)) url = url.replace(/\.gifv$/, ".mp4");
                if (!/(jpe?g|png|gif)$/.test(url)) url = url + ".png";
            }

            return message
                .reply(toppost.title, {
                    files: [url],
                })
                .catch(() => message.reply(`${toppost.title}\n${toppost.url}`));
        }
    }

    return message.reply("top [A-z0-9]+");
};
