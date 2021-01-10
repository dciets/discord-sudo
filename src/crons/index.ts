import { Client } from "discord.js";
import cron from "cron";

import blazeIt from "./blazeIt";
import pogchamp from "./pogchamp";

export function startCronJobs(client: Client) {
    new cron.CronJob(
        "0 20 4,16 * * *",
        blazeIt(client),
        null,
        true,
        "America/Montreal"
    );

    new cron.CronJob(
        "0 0 */4 * * *",
        pogchamp(client),
        null,
        true,
        "America/Montreal"
    );
}
