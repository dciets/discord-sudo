import DiscordJS from "discord.js";

export default (message: DiscordJS.Message): boolean => {
    if (
        message.guild
            ?.member(message.author)
            ?.roles.cache.map((r) => r.name)
            .includes("sudo-banned")
    )
        return false;
    return true;
};
