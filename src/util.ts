import { Stream, Writable, Readable } from "stream";

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = (
    stream: { once: (event: string, ...args: any[]) => any },
    event: string
) => new Promise((resolve) => stream.once(event, resolve));
