import axios from 'axios';
import Discord from 'discord.js';
import { Module } from "../../core";
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

const CHECK_INTERVAL_MINUTES = 2;
const URL = 'http://api.rscount.se/rs/count/000B91906EDA';

type FysikenUser = {
    id: string;
    threshold: number;
};

class FysikenModule extends Module {
    users: FysikenUser[];
    client!: Discord.Client<true>;
    interval: NodeJS.Timeout | null = null;

    constructor() {
        super('Fysiken');
        this.users = [];
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

    addUser(user: Discord.User, threshold: number) {
        const existingUser = this.users.find(u => u.id === user.id);

        if(existingUser) {
            existingUser.threshold = threshold;
        } else {
            this.users.push({
                id: user.id,
                threshold: threshold
            });
        }

        log.debug(`addUser (id=${user.id}, threshold=${threshold})`);
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
        if(!this.users.length) return;

        try {
            const currentVal = await this.getCurrentValue();

            const usersToNotify = this.users.filter(u => u.threshold >= currentVal);
            const otherUsers = this.users.filter(u => u.threshold < currentVal);

            for(const user of usersToNotify) {
                await this.notifyUser(user, currentVal);
            }

            // Users not notified gets saved until next check
            this.users = otherUsers;
        } catch(e) {
            if(e instanceof Error) {
                log.error(e.message);
            } else {
                log.error(e);
            }
        }
    }

    async notifyUser(user: FysikenUser, currentVal: number) {
        log.debug(`notifyUser (id=${user.id}, current=${currentVal}, threshold=${user.threshold})`);
        const discordUser = await this.client.users.fetch(user.id);
        await discordUser.send(`WORKOUT TIME SOYBOY! Only ${currentVal} sweaty nerds @ Fysiken`);
    }
}

export default new FysikenModule();
