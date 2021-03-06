import { Message, SnowflakeUtil, TextChannel, VoiceState } from "discord.js";
import commands from "../../commands";

const ZERGOV_MEMBER_ID = "250111267258236929";

export default (oldState: VoiceState, newState: VoiceState) => {
    if (newState.member?.id !== ZERGOV_MEMBER_ID) return;

    const client = newState.guild.client;
    const sudoChannel = newState.guild.channels.cache.find((c) => c.name === "sudo" && c.type === "text") as TextChannel;

    if (!sudoChannel) return;

    const messageData = {
        id: SnowflakeUtil.generate(),
        author: newState.member,
        content: "sudo sb chirp",
    };

    // Since this message never existed, flag this message has deleted to prevent reactions from the bot.
    const commandMessage = new Message(client, messageData, sudoChannel);
    commandMessage.deleted = true;

    commands.execute(commandMessage);
};
