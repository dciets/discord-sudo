import { Client } from 'discord.js';
import cron from "cron";
import blazeIt from './blazeIt'

export function startCronJobs(client: Client) {
    new cron.CronJob('00 20 4,16 * * *', blazeIt(client), null, true, "America/Montreal");
}
