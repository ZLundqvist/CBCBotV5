import { Module } from "@core";
import getLogger from '@utils/logger';
import Discord from 'discord.js';
import { GuildAudio } from "./guild-audio";

const log = getLogger(__dirname);

class AudioModule extends Module {
    private guildAudio: Discord.Collection<string, GuildAudio>;

    constructor() {
        super('Audio');
        this.guildAudio = new Discord.Collection();
    }

    async init(client: Discord.Client<true>): Promise<void> {
        // No need to init
    }

    getGuildAudio(guild: Discord.Guild): GuildAudio {
        let guildAudio = this.guildAudio.get(guild.id);

        if(!guildAudio) {
            guildAudio = new GuildAudio(guild);
            this.guildAudio.set(guild.id, guildAudio);
            log.debug(`Created GuildAudio: ${guild.name}`);
        }

        return guildAudio;
    }
}

export default new AudioModule();