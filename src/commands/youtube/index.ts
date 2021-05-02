import DiscordJS from "discord.js";
import { __ } from "i18n";
import { google } from "googleapis";
import Command from "../command";

const youtubeV3 = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_APIKEY,
});

class Youtube extends Command {
  constructor() {
    super(["youtube", "yt"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    if (args.length > 0) {
      if (!process.env.YOUTUBE_APIKEY)
        return message.reply("no youtube api key is configured :(");

      const response = await youtubeV3.search.list({
        part: ["snippet"],
        maxResults: 1,
        order: "relevance",
        q: args.join(" "),
      });

      const items = response?.data?.items;

      if (items) {
        const videoId = items[0].id?.videoId;
        return message.reply(`https://www.youtube.com/watch?v=${videoId}`);
      }
    }

    return message.reply("youtube [\\w\\ ]+");
  }
}

export default new Youtube();
