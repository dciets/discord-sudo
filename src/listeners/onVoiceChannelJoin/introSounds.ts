import { Message, SnowflakeUtil, TextChannel, VoiceState } from "discord.js";
import commands from "../../commands";
import intro from "../../db/intro";

/**
 * Play sounds when a user connects to a voice channel.
 * To add a sound, use `sudo intro`.
 */
export default async (oldState: VoiceState, newState: VoiceState) => {

    const introSound = await intro.findOne({
        gid: newState.member?.guild.id,
        uid: newState.member?.id
    });
    if (!introSound) return;

    const client = newState.guild.client;
    const sudoChannel = newState.guild.channels.cache.find((c) => c.name === "sudo" && c.type === "text") as TextChannel;

    if (!sudoChannel) return;

    const messageData = {
        id: SnowflakeUtil.generate(),
        author: newState.member,
        content: `sudo sb ${introSound.key}`,
    };

    // Since this message never existed, flag this message as deleted to prevent reactions from the bot.
    const commandMessage = new Message(client, messageData, sudoChannel);
    commandMessage.deleted = true;

    commands.execute(commandMessage);
};
