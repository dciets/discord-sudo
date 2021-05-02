import DiscordJS from "discord.js";
import Command from "../command";
import fetch from "node-fetch";
import fs from "fs";
import { autodisconnect, waitFor } from "../../util";

import { Readable } from "stream";

class Brian extends Command {
  constructor() {
    super(["brian"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    const channel = message.member?.voice.channel;
    const guildId = message.guild?.id;

    if (!channel || !guildId) return message.react("🔇");

    const connection = await channel.join();
    if (!connection) return message.react("🔇");
    autodisconnect(message);

    const text = args.join(" ");
    let response = await fetch(
      "https://us-central1-sunlit-context-217400.cloudfunctions.net/streamlabs-tts",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({ text, voice: "Brian" }),
        method: "POST",
      }
    );

    if (!response.ok) return message.react("🔇");

    const { speak_url } = await response.json();
    response = await fetch(speak_url);

    if (!response.ok) return message.react("🔇");

    const buffer = await response.buffer();
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);

    const dispatch = connection.play(readable);

    let timeout = setTimeout(() => dispatch.end(), 10000);
    await waitFor(dispatch, "finish");
    clearTimeout(timeout);

    return message.react("👍");
  }
}

export default new Brian();
