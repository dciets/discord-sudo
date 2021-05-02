import { Message, SnowflakeUtil, TextChannel, VoiceState } from "discord.js";
import commands from "../../commands";

const JESUS_MEMBER_ID = "191931417314328576";

export default (oldState: VoiceState, newState: VoiceState) => {
    if (newState.member?.id !== JESUS_MEMBER_ID) return;

    const client = newState.guild.client;
    const sudoChannel = newState.guild.channels.cache.find((c) => c.name === "sudo" && c.type === "text") as TextChannel;

    if (!sudoChannel) return;

    const messageData = {
        id: SnowflakeUtil.generate(),
        author: newState.member,
        content: "sudo sb avemaria",
    };

    // Since this message never existed, flag this message as deleted to prevent reactions from the bot.
    const commandMessage = new Message(client, messageData, sudoChannel);
    commandMessage.deleted = true;

    commands.execute(commandMessage);
};
