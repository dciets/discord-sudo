import DiscordJS from "discord.js";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    if (!message.member?.voice.channel) return message.reply("Bruh, i'm dead 😂👌");

    const connection = await message.member.voice.channel.join();
    const dispatcher = connection.play("./assets/audio/bruh.mp3");

    return new Promise((resolve) =>
        dispatcher.on("finish", () => {
            message.member?.voice.channel?.leave();
            dispatcher.end();

            resolve();
        })
    );
};
