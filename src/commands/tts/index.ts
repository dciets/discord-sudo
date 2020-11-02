declare var gtts: any;
const gTTS = require("gtts");

import DiscordJS from "discord.js";
import fs from "fs";

import Command from "../command";
import { autodisconnect, waitFor } from "../../util";

const LANGUAGES = {
    af: "Afrikaans",
    sq: "Albanian",
    ar: "Arabic",
    hy: "Armenian",
    ca: "Catalan",
    zh: "Chinese",
    "zh-cn": "Chinese (Mandarin/China)",
    "zh-tw": "Chinese (Mandarin/Taiwan)",
    "zh-yue": "Chinese (Cantonese)",
    hr: "Croatian",
    cs: "Czech",
    da: "Danish",
    nl: "Dutch",
    en: "English",
    "en-au": "English (Australia)",
    "en-uk": "English (United Kingdom)",
    "en-us": "English (United States)",
    eo: "Esperanto",
    fi: "Finnish",
    fr: "French",
    de: "German",
    el: "Greek",
    ht: "Haitian Creole",
    hi: "Hindi",
    hu: "Hungarian",
    is: "Icelandic",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    la: "Latin",
    lv: "Latvian",
    mk: "Macedonian",
    no: "Norwegian",
    pl: "Polish",
    pt: "Portuguese",
    "pt-br": "Portuguese (Brazil)",
    ro: "Romanian",
    ru: "Russian",
    sr: "Serbian",
    sk: "Slovak",
    es: "Spanish",
    "es-es": "Spanish (Spain)",
    "es-us": "Spanish (United States)",
    sw: "Swahili",
    sv: "Swedish",
    ta: "Tamil",
    th: "Thai",
    tr: "Turkish",
    vi: "Vietnamese",
    cy: "Welsh",
};

const play = async (
    connection: DiscordJS.VoiceConnection,
    text: string,
    lang = "en"
) => {
    const gtts = new gTTS(text, lang);
    const filename = "./tmp/" + Date.now() + ".mp3";
    await new Promise((resolve, reject) =>
        gtts.save(filename, (err: Error, result: any) =>
            err ? reject(err) : resolve(result)
        )
    );

    const stream = fs.createReadStream(filename);
    const dispatch = connection.play(stream);

    let timeout = setTimeout(() => dispatch.end(), 10000);
    await waitFor(dispatch, "finish");
    clearTimeout(timeout);

    await fs.promises.unlink(filename);
};

class TextToSpeech extends Command {
    constructor() {
        super(["tts"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        const channel = message.member?.voice.channel;
        const guildId = message.guild?.id;

        if (args.length === 1 && args[0] === "?") {
            return message.reply(
                "```\n" +
                    Object.keys(LANGUAGES)
                        .map((lang) => `${lang} => ${(LANGUAGES as any)[lang]}`)
                        .join("\n") +
                    "\n```"
            );
        }

        if (!channel || !guildId) return message.react("🔇");

        const connection = await channel.join();
        if (!connection) return message.react("🔇");
        autodisconnect(message);

        const default_language = message.author.locale || "en";
        let text = args.join(" ");
        if (!/^([a-z\-]+):/.test(text)) text = default_language + ":" + text;

        const regex = /([a-z\-]+):/g;
        const matches = [];
        let match;
        while ((match = regex.exec(text)))
            matches.push({ lang: match[1], index: match.index });

        for (let i = 0; i < matches.length; ++i) {
            const match = matches[i];
            const next_match = matches[i + 1];
            let text_segment = next_match
                ? text.slice(match.index, next_match.index)
                : text.slice(match.index);
            text_segment = text_segment.slice(text_segment.indexOf(":") + 1);

            await play(
                connection,
                text_segment,
                (LANGUAGES as any)[match.lang] ? match.lang : default_language
            );
        }

        return message.react("👍");
    }
}

export default new TextToSpeech();
