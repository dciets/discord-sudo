import DiscordJS from "discord.js";
import { __mf } from "i18n";

import random from "../random";
import Command from "../command";

class Roll extends Command {
    constructor() {
        super(["roll"]);
    }

    public async execute(message: DiscordJS.Message, ...args: string[]) {
        if (args.length === 0)
            return message.reply(
                __mf("rolled a %s", random.range(1, 6).toString())
            );
        else if (args.length === 1) {
            if (/^\d+$/.test(args[0]))
                return message.reply(
                    __mf(
                        "rolled a %s",
                        random.range(1, Number(args[0])).toString()
                    )
                );
            else if (/^\d+d\d+$/.test(args[0])) {
                const [n, d] = args[0].split("d").map(Number);
                const rolls = Array(n)
                    .fill(0)
                    .map(() => random.range(1, d));
                const total = rolls.reduce((a, b) => a + b, 0);
                return message
                    .reply(__mf("rolled a %s", `(${rolls.join("+")})=${total}`))
                    .catch(() =>
                        message.reply(
                            __mf("rolled a %s", `(too many rolls)=${total}`)
                        )
                    );
            }
        } else if (args.every((arg) => /^(\d+|\d+d\d+)$/.test(arg))) {
            const rolls = (
                args.map((arg) => {
                    if (/^\d+$/.test(arg))
                        return [random.range(1, Number(args[0]))];
                    else if (/^\d+d\d+$/.test(arg)) {
                        const [n, d] = arg.split("d").map(Number);
                        return Array(n)
                            .fill(0)
                            .map(() => random.range(1, d));
                    } else return [];
                }) || []
            ).filter((roll) => roll.length > 0);
            const total = rolls.reduce(
                (a, b) => a + b.reduce((c, d) => c + d, 0),
                0
            );

            return message
                .reply(
                    __mf(
                        "rolled a %s",
                        `(${rolls
                            .map((roll) => "(" + roll.join("+") + ")")
                            .join("+")})=${total}`
                    )
                )
                .catch(() =>
                    message.reply(
                        __mf("rolled a %s", `(too many rolls)=${total}`)
                    )
                );
        }

        return message.reply("roll [\\d|\\dd\\d]+?");
    }
}

export default new Roll();
