import Discord from 'discord.js';
import { clearInterval } from 'timers';
import { Module } from '../../core';
import { inVoiceChannel } from '../../utils/voice';
import audio from '../audio';


type PostureCheckInterval = {
    id: NodeJS.Timeout; // intervalId
    period: number;     // Period in minutes
};

class PostureCheckModule extends Module {
    private guildIntervals: Discord.Collection<string, PostureCheckInterval>;

    constructor() {
        super('posture-check');
        this.guildIntervals = new Discord.Collection();
    }

    async init(client: Discord.Client<true>): Promise<void> { }

    async destroy(): Promise<void> {
        for(const interval of this.guildIntervals.values()) {
            clearInterval(interval.id);
        }

        this.guildIntervals.clear();
    }

    /**
     * 
     * @param guild 
     * @param period Period in minutes between PC's 
     */
    async enable(guild: Discord.Guild, period: number) {
        const currentInterval = this.guildIntervals.get(guild.id);

        // Disable old timer if it exists
        if(currentInterval) {
            this.disable(guild);
        }

        const intervalId = setInterval(() => {
            this.doPostureCheck(guild);
        }, period * 1000 * 60);

        this.guildIntervals.set(guild.id, {
            id: intervalId,
            period: period
        })

        this.log.debug(`Enabled (guild: ${guild.name}, interval: ${period} minutes)`);

        this.doPostureCheck(guild);
    }

    disable(guild: Discord.Guild) {
        const interval = this.guildIntervals.get(guild.id);

        if(interval) {
            clearInterval(interval.id);
            this.guildIntervals.delete(guild.id);
            this.log.debug(`Disabled (guild: ${guild.name})`);
        }
    }

    private async doPostureCheck(guild: Discord.Guild): Promise<void> {
        if(!guild.me) {
            this.log.warn('guild.me is null, cannot play PC');
            return;
        }

        if(!inVoiceChannel(guild)) {
            this.log.debug(`Tried to perform PC without VoiceConnection, disabling (guild: ${guild.name})`);
            this.disable(guild);
            return;
        }

        const guildAudio = audio.getGuildAudio(guild);

        if(guildAudio.isPlaying) {
            this.log.debug(`Audio playing in guild, skipping (guild: ${guild.name})`);
            return;
        }

        try {
            this.log.debug(`Performing PostureCheck (guild: ${guild.name})`);
            await guildAudio.smartQueue('pc', guild.me, false);
        } catch(error: any) {
            this.log.warn(`Unable to queue PostureCheck: ${error.message}`);
        }
    }
}

export default new PostureCheckModule();
