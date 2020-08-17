import DiscordJS from "discord.js";
import { __ } from "i18n";
import { google } from 'googleapis';

const youtubeV3 = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_APIKEY,
});

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (args.length > 0) {
        try {
            const response = await youtubeV3.search.list({
                "part": [
                  "snippet"
                ],
                "maxResults": 1,
                "order": "relevance",
                "q": args.join(" "),
            });

            const items = response?.data?.items;

            if (items) {
                const videoId = items[0].id?.videoId;
                return message.reply(`https://www.youtube.com/watch?v=${videoId}`);
            }
        } catch (e) {
            console.error(e);
            return message.reply(e.message);
        }
    }

    return message.reply("youtube [\\w\\ ]+");
};
