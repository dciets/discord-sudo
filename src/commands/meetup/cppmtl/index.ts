import DiscordJS from "discord.js";

import Command from "../../command";
import Meetup from "../meetup";

class CppMtl extends Command {
    constructor() {
        super(["cppmtl"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        await message.react("🍕");
        return Meetup.execute(message, "CppMtl");
    }
}

export default new CppMtl();
