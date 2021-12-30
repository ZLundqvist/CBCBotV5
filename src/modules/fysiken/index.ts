import axios from 'axios';
import Discord from 'discord.js';
import { Module } from "../../core";

const CHECK_INTERVAL_MINUTES = 2;
const URL = 'http://api.rscount.se/rs/count/000B91906EDA';


class FysikenModule extends Module {
    client!: Discord.Client<true>;
    interval?: NodeJS.Timeout;
    thresholds: Discord.Collection<string, number>;

    constructor() {
        super('fysiken');
        this.thresholds = new Discord.Collection();
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.client = client;
        this.interval = setInterval(() => this.check(), CHECK_INTERVAL_MINUTES * 60 * 1000);
    }

    async destroy(): Promise<void> {
        if(this.interval) {
            clearInterval(this.interval);
        }
    }

    setThresholdForUser(user: Discord.User, threshold: number) {
        this.thresholds.set(user.id, threshold);
        this.log.debug(`setThresholdForUser (id=${user.id}, threshold=${threshold})`);
    }

    async getCurrentValue(): Promise<number> {
        const response = await axios.get(URL);
        const currentVal = response.data;

        if(typeof currentVal === 'number') {
            return currentVal;
        }

        throw new Error('Returned data is not a number');
    }

    async check() {
        const users = this.thresholds.map((value, key) => {
            return {
                userId: key,
                threshold: value
            };
        });

        try {
            const currentVal = await this.getCurrentValue();
            const usersToNotify = users.filter(u => u.threshold >= currentVal);
            for(const user of usersToNotify) {
                await this.notifyUser(user.userId, user.threshold, currentVal);
                this.thresholds.delete(user.userId);
            }
        } catch(error) {
            this.log.error(error);
        }
    }

    async notifyUser(userId: string, threshold: number, currentVal: number) {
        this.log.debug(`notifyUser (id=${userId}, current=${currentVal}, threshold=${threshold})`);
        const discordUser = await this.client.users.fetch(userId);
        await discordUser.send(`WORKOUT TIME SOYBOY! Only ${currentVal} sweaty nerds @ Fysiken`);
    }
}

export default new FysikenModule();
