import DiscordJS from "discord.js";
import fetch from "node-fetch";

import Command from "../../command";

class Meetup extends Command {
    constructor() {
        super(["meetup"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (args.length !== 1) {
            return message.reply(
                "Usage: \n sudo meetup <short meetup name (URL name)>"
            );
        } else {
            return message.channel.send(
                await fetch(`https://api.meetup.com/${args[0]}/events`)
                    .then((r) => r.json())
                    .then(
                        (json) =>
                            json[0]?.link ||
                            "uhho... There doesn't seem to be an upcomming event!\n Here's a link anyway https://www.meetup.com/CppMtl/"
                    )
            );
        }
    }
}

export default new Meetup();
