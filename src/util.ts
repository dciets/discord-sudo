import DiscordJS from "discord.js";

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = (
    stream: { once: (event: string, ...args: any[]) => any },
    event: string
) => new Promise((resolve) => stream.once(event, resolve));

export const htmldecode = (() => {
    const htmlentities: any = {
        nbsp: " ",
        cent: "¢",
        pound: "£",
        yen: "¥",
        euro: "€",
        copy: "©",
        reg: "®",
        lt: "<",
        gt: ">",
        quot: '"',
        amp: "&",
        apos: "'",
    };

    return (str: string) =>
        str.replace(/&(.+?);/g, (substr: string, ...args: string[]) => {
            if (htmlentities[args[0]]) return htmlentities[args[0]];
            else if (args[0].indexOf("#x") === 0)
                return String.fromCharCode(
                    parseInt(args[0].substr(2), 16) || 63
                );
            else if (args[0].indexOf("#") === 0)
                return String.fromCharCode(parseInt(args[0].substr(1)) || 63);
            else return substr;
        });
})();

export const lock = (() => {
    const locks: { [key: string]: number[] } = {};

    return {
        wait: async (gid: string) => {
            if (!locks[gid]) locks[gid] = [];
            const key = Date.now();
            locks[gid].push(key);

            while (locks[gid][0] !== key) await sleep(100);
        },
        free: (gid: string) => {
            if (!locks[gid]) throw new Error("uhhh?");
            locks[gid].shift();
        },
    };
})();

export const paginateMessage = async (
    message: DiscordJS.Message,
    userid: string,
    onreact: (action: "UP" | "TOP" | "DOWN" | "BOTTOM") => Promise<void>
) => {
    await message.react("⬆️");
    await message.react("⏫");
    await message.react("⬇️");
    await message.react("⏬");

    try {
        while (true) {
            const collected = await message.awaitReactions(
                (reaction: DiscordJS.MessageReaction, user: DiscordJS.User) =>
                    ["⬆️", "⬇️", "⏬", "⏫"].includes(reaction.emoji.name) &&
                    user.id === userid,
                {
                    max: 1,
                    time: 60000,
                    errors: ["time"],
                }
            );

            const first = collected.first();
            if (!first) continue;

            switch (first.emoji.name) {
                case "⬆️":
                    await onreact("UP");
                    break;
                case "⏫":
                    await onreact("TOP");
                    break;
                case "⬇️":
                    await onreact("DOWN");
                    break;
                case "⏬":
                    await onreact("BOTTOM");
                    break;
            }

            await first.users.remove(userid);
        }
    } catch (e) {}
};

export const autodisconnect = (() => {
    const timeout = Number(process.env.AUTO_DISCONNECT || "300000");
    const locks: { [key: string]: NodeJS.Timeout } = {};

    return (message: DiscordJS.Message) => {
        const disconnect = () => {
            if (message.guild?.me?.voice)
                message.guild?.me.voice.channel?.leave();
        };

        if (!message.guild) return;
        if (!locks[message.guild.id])
            locks[message.guild.id] = setTimeout(disconnect, timeout);
        else {
            clearTimeout(locks[message.guild.id]);
            locks[message.guild.id] = setTimeout(disconnect, timeout);
        }
    };
})();
