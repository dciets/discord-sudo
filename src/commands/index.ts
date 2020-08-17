import DiscordJS from "discord.js";
import i18n from "i18n";

import permissions from "./permissions";

import _8ball from "./8ball";
import bruh from "./bruh";
import chucknorris from "./chucknorris";
import fart from "./fart";
import honk from "./honk";
import kebac from "./kebac";
import pick from "./pick";
import ping from "./ping";
import pong from "./pong";
import roll from "./roll";
import sb from "./sb";
import surun from "./surun";
import top from "./top";
import xkcd from "./xkcd";
import youtube from "./youtube";

const prefix = "sudo ";

const commands: {
    [key: string]: (
        message: DiscordJS.Message,
        ...args: string[]
    ) => Promise<any>;
} = {
    _8ball,
    bruh,
    chucknorris,
    fart,
    honk,
    kebac,
    pick,
    ping,
    pong,
    roll,
    sb,
    surun,
    top,
    xkcd,
    youtube,
};

export default async (
    client: DiscordJS.Client,
    message: DiscordJS.Message
): Promise<any> => {
    try {
        if (message.author.bot) return;
        if (!message.guild) return;

        if (!permissions(message)) return message.react("🚫");

        if (message.mentions.everyone) {
            await message.react("🇦");
            await message.react("🇳");
            await message.react("🇬");
            await message.react("🇪");
            await message.react("🇷");
            await message.react("🇾");
            return message.react("😡");
        }
        if (client.user && message.mentions.has(client.user))
            return message.react("👀");

        if (message.content.indexOf(prefix) !== 0) return;

        let command = message.content.substr(prefix.length).split(" ")[0];
        if (/^\d/.test(command)) command = "_" + command;

        console.log(
            message.member?.displayName,
            message.member?.id,
            message.content
        );

        if (commands[command]) {
            i18n.setLocale(message.author.locale || "en");
            return await commands[command](
                message,
                ...message.content.substr(prefix.length).split(" ").slice(1)
            );
        }

        console.log("command not found", command);
        return message.reply("koi");
    } catch (e) {
        console.error(e);
        if (process.env.NODE_ENV !== "production")
            return message.reply(e.message);
        else return message.reply("☠️");
    }
};
