import { Client } from "discord.js";
import cron from "cron";

import pogchamp from "./pogchamp";

export function startCronJobs(client: Client) {
    new cron.CronJob(
        "0 0 * * * *",
        pogchamp(client),
        null,
        true,
        "America/Montreal"
    );
}
