import { Client } from "discord.js";
import fetch from "node-fetch";

export default (client: Client) => {
    return async () => {
        const globalemoteset = await fetch(
            "https://api.twitch.tv/kraken/chat/emoticon_images?emotesets=0",
            {
                headers: {
                    "Client-ID": process.env.TWITCH_APIKEY,
                    Accept: "application/vnd.twitchtv.v5+json",
                } as any,
            }
        )
            .then((r) => r.json())
            .then((json) => json.emoticon_sets["0"]);

        const pogchampid = globalemoteset.find(
            ({ code }: { code: string; id: string }) => code === "PogChamp"
        ).id;

        const newpogchamp = await fetch(
            `https://static-cdn.jtvnw.net/emoticons/v1/${pogchampid}/4.0`
        ).then(
            (r): Promise<Buffer> => {
                return new Promise((resolve, reject) => {
                    let buffer = Buffer.from("");
                    r.body.on(
                        "data",
                        (data: Buffer) =>
                            (buffer = Buffer.concat([buffer, data]))
                    );
                    r.body.on("finish", () => resolve(buffer));
                    r.body.on("error", (err) => reject(err));
                });
            }
        );

        client.guilds?.cache.each(async (guild) => {
            await guild.emojis.cache
                .find((emoji) => emoji.name === "PogChamp")
                ?.delete();
            guild.emojis.create(newpogchamp, "PogChamp");
        });
    };
};
