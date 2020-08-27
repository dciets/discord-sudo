import DiscordJS from "discord.js";

import Command from "../../command";
import { search } from "../dogapi";

class DogBomb extends Command {
    constructor() {
        super(["dogbomb", "dog bomb"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (!process.env.DOG_APIKEY)
            return message.reply("missing dog apikey :(");

        const dogs = await search({
            subid: message.author.id.toString(),
            limit: 10,
        });
        return message.reply("", { files: dogs.map((dog: any) => dog.url) });
    }
}

export default new DogBomb();
