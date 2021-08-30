import Discord from 'discord.js';
import { clearInterval } from 'timers';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import ResourceHandler from '../../core/resource-handler';
import { Guild } from "../../database/entity/guild";
import getLogger from '../../utils/logger';
import audio from "../audio";

const log = getLogger(__dirname);

interface GuildInterval {
    readonly guildID: string;
    period: number;             // Zero if disabled
    timer: NodeJS.Timeout | null; // null if disabled
}

class PostureCheck extends Module {
    guildIntervals: GuildInterval[] = [];

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

        if(!await this.getSFX(guild)) {
            throw new CommandError('PostureCheck SFX is not set.');
        }

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

    async getSFX(guild: Discord.Guild): Promise<string | null> {
        const guildDB = await Guild.findOneOrFail(guild.id);

        if(guildDB.pcsound && !ResourceHandler.sfxExists(guildDB.pcsound)) {
            return null;
        }

        return guildDB.pcsound;
    }

    async setSFX(guild: Discord.Guild, sfx: string) {
        const guildDB = await Guild.findOneOrFail(guild.id);

        if(!ResourceHandler.sfxExists(sfx)) {
            throw new CommandError(`SFX does not exist: ${sfx}`);
        }

        guildDB.pcsound = sfx;
        await guildDB.save();
        log.info(`Posture check sound set in ${guild.name}: ${guildDB.pcsound}`);
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
        if(audio.isPlaying(guild)) {
            return;
        }

        if(!guild.me) {
            log.warn('guild.me is null, cannot play PC');
            return;
        }

        const sfx = await this.getSFX(guild);
        if(!sfx) {
            this.disable(guild);
            throw new Error(`No SFX: ${guild.name}`);
        }

        audio.play(guild.me, sfx);
    }
}

export default new PostureCheck();