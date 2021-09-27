import { Module } from '@core';
import audio from '@modules/audio';
import getLogger from '@utils/logger';
import Discord from 'discord.js';
import { clearInterval } from 'timers';

const log = getLogger(__dirname);

interface GuildInterval {
    readonly guildID: string;
    period: number;             // Zero if disabled
    timer: NodeJS.Timeout | null; // null if disabled
}

class PostureCheckModule extends Module {
    private guildIntervals: GuildInterval[] = [];

    constructor() {
        super('PostureCheck');
    }

    async init(client: Discord.Client): Promise<void> { }

    getPeriod(guild: Discord.Guild): number {
        return this.getGuildInterval(guild).period;
    }

    isRunning(guild: Discord.Guild): boolean {
        return this.getGuildInterval(guild).timer !== null;
    }

    /**
     * 
     * @param guild 
     * @param period Period in minutes between PC's 
     */
    async enable(guild: Discord.Guild, period: number) {
        let interval = this.getGuildInterval(guild);

        // Disable old timer if it exists
        if(this.isRunning(guild)) {
            this.disable(guild);
        }

        interval.period = period;
        interval.timer = setInterval(() => {
            this.performPC(guild);
        }, interval.period * 1000 * 60);
        this.performPC(guild);

        log.debug(`PostureCheck enabled in ${guild.name}: ${interval.period}`);
    }

    disable(guild: Discord.Guild) {
        let interval = this.getGuildInterval(guild);

        if(interval.timer) {
            clearInterval(interval.timer);
            interval.period = 0;
            interval.timer = null;
        }
    }

    private getGuildInterval(guild: Discord.Guild): GuildInterval {
        let interval = this.guildIntervals.find(item => item.guildID === guild.id);

        if(!interval) {
            interval = {
                guildID: guild.id,
                period: 0,
                timer: null
            };

            this.guildIntervals.push(interval);
        }

        return interval;
    }

    private async performPC(guild: Discord.Guild) {
        const guildAudio = audio.getGuildAudio(guild);

        if(guildAudio.isPlaying()) {
            return;
        }

        if(!guild.me) {
            log.warn('guild.me is null, cannot play PC');
            return;
        }

        await guildAudio.queue(guild.me, 'pc', false, false);
    }
}

export default new PostureCheckModule();
