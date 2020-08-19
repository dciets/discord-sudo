import i18n from "i18n";
i18n.configure({
    locales: ["fr", "en"],
    defaultLocale: "en",
    directory: "./locales",
    extension: ".json",
    register: global,
});

import DiscordJS from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import * as db from "./db";
import commands from "./commands";

if (!process.env.TOKEN) {
    console.error("missing token");
    process.exit(1);
}

const client: DiscordJS.Client = new DiscordJS.Client()
    .on("ready", () => console.log("connected :)"))
    .on("rateLimit", console.warn)
    .on("error", console.error)
    .on("disconnect", () => console.log("disconnected :("))
    .on("message", commands);

db.init().then(() => client.login(process.env.TOKEN));
