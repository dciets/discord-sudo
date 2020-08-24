import DiscordJS from "discord.js";
import i18n from "i18n";

import Command from "./command";
import permissions from "./permissions";
import init from "./init";

import { lock } from "../util";

const prefix = "sudo ";

class Manager {
    private _commands: { [key: string]: Command } = {};

    public async init() {
        return await init();
    }

    public register(prefixes: string[], command: Command) {
        if (prefixes.length === 0)
            throw new Error("Please register at least 1 prefix for a command");

        for (let prefix of prefixes) {
            if (this._commands[prefix])
                throw new Error("Command already registered");
            this._commands[prefix] = command;
        }
    }

    public async execute(message: DiscordJS.Message): Promise<void> {
        if (message.author.bot || !message.guild) return;
        else if (
            message.client.user &&
            message.mentions.has(message.client.user)
        ) {
            await message.react("👀");
            return;
        }

        if (message.content.indexOf(prefix) !== 0) return;
        if (!permissions(message)) {
            await message.react("🚫");
            return;
        }

        try {
            await lock.wait(message.guild.id);
            let command = message.content.substr(prefix.length).split(" ")[0];
            const args: string[] = message.content
                .substr(prefix.length)
                .split(" ")
                .slice(1);

            console.log(
                message.member?.displayName,
                message.member?.id,
                message.guild.id,
                message.content
            );

            while (true) {
                if (this._commands[command]) {
                    i18n.setLocale(message.author.locale || "en");
                    this._commands[command].execute(message, ...args);
                    return;
                }

                if (args.length === 0) {
                    console.log("command not found", command);
                    await message.react("❓");
                    return;
                }

                command += " " + args.shift();
            }
        } catch (e) {
            console.error(e);
            if (process.env.NODE_ENV !== "production")
                await message.reply(`${e.message}\n\`\`\`${e.stack}\`\`\``);
            else await message.react("☠️");
        } finally {
            lock.free(message.guild.id);
        }
    }

    public get commands() {
        return this._commands;
    }
}

export default new Manager();
