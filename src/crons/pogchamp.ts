import { Client } from "discord.js";
import fetch from "node-fetch";

export default (client: Client) => {
    return () => {
        client.guilds?.cache.each(async (guild) => {
            await guild.emojis.cache
                .find((emoji) => emoji.name === "PogChamp")
                ?.delete();

            const newpogchamp = await fetch(
                "https://static-cdn.jtvnw.net/emoticons/v1/305289452/4.0" // reste a voir si le emote id change
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

            guild.emojis.create(newpogchamp, "PogChamp");
        });
    };
};
