import { Client, TextChannel, VoiceChannel } from 'discord.js';
import { waitFor } from '../util';

export default (client: Client) => {
    return () => {
        client.guilds?.cache.each(async ({ channels }) => {
            const generalText = channels.cache.find(c => c.type === "text" && c.name === "général") as TextChannel
            if (generalText) generalText.send("🔥 blaze it 🌿🔥");

            const generalVoice = channels.cache.find(c => c.type === "voice" && c.name === "Général") as VoiceChannel
            if (!generalVoice) return;

            const connection = await generalVoice.join();
            const dispatcher = connection.play("./assets/audio/smokeweed-everyday.mp3");
            await waitFor(dispatcher, "finish")
            dispatcher.end();
            generalVoice.leave();
        })
    }
}
