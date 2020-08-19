import { Stream, Writable, Readable } from "stream";

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = (
    stream: { once: (event: string, ...args: any[]) => any },
    event: string
) => new Promise((resolve) => stream.once(event, resolve));

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

export const htmldecode = (str: string) =>
    str.replace(/&(.+?);/g, (substr: string, ...args: string[]) => {
        if (htmlentities[args[0]]) return htmlentities[args[0]];
        else if (args[0].indexOf("#x") === 0)
            return String.fromCharCode(parseInt(args[0].substr(2), 16) || 63);
        else if (args[0].indexOf("#") === 0)
            return String.fromCharCode(parseInt(args[0].substr(1)) || 63);
        else return substr;
    });
