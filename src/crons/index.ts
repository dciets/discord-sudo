import { Client } from "discord.js";
import cron from "cron";

import blazeIt from "./blazeit";

export function startCronJobs(client: Client) {
    new cron.CronJob(
        "0 20 4,16 * * *",
        blazeIt(client),
        null,
        true,
        "America/Montreal"
    );
}
