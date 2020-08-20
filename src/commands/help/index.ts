import DiscordJS from "discord.js";

export default async (message: DiscordJS.Message, ...args: string[]) => {
    switch (args[0]) {
        case "8ball":
        case "chucknorris":
        case "github":
        case "kebac":
        case "pick":
        case "ping":
        case "pong":
        case "roll":
        case "sb":
        case "sba":
        case "sbe":
        case "sbl":
        case "sbr":
        case "surun":
        case "top":
        case "xkcd":
        case "youtube":
            return message.reply("TODO");
        case "help":
            return message.react("🙄");
        default:
            return message.reply(`not even god can help you`);
    }
};
