import DiscordJS from "discord.js";
import fetch from "node-fetch";
import Command from "../../command";
import Meetup from "../meetup";

class cppmtl extends Command {
    public async execute(message: DiscordJS.Message, ...args: string[]) {
        return Meetup.execute(message, "CppMtl");
    }
}

export default new cppmtl(["cppmtl"]);
