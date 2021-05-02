import { Client, VoiceChannel } from "discord.js";
import { waitFor } from "../util";

export default function (client: Client) {
  return () => {
    client.guilds?.cache.each(async ({ channels }) => {
      const generalVoice = channels.cache.find(
        (c) => c.type === "voice" && c.name === "Général"
      ) as VoiceChannel;

      if (!generalVoice) return;
      if (generalVoice.members.size == 0) return;

      const connection = await generalVoice.join();
      const dispatcher = connection.play(
        "./assets/audio/smokeweed-everyday.mp3"
      );
      await waitFor(dispatcher, "finish");
      dispatcher.end();
      generalVoice.leave();
    });
  };
}
