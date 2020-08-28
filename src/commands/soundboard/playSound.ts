import { VoiceConnection } from "discord.js";
import soundboard from "../../db/soundboard";
import { waitFor } from "../../util";
import { Readable } from "stream";

export default async (gid: string, sound: string, connection: VoiceConnection) => {
    const file = await soundboard.findOne({ gid, key: sound });

    if (!file) throw new Error("sound not found");

    const readable = new Readable({
        read() {
            this.push(file.val);
            this.push(null);
        },
    });

    const dispatcher = connection.play(readable);

    await waitFor(dispatcher, "finish");

    dispatcher.end();
    readable.destroy();
}
