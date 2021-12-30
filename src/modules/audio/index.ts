import Discord from 'discord.js';
import { Module } from "../../core";
import { GuildAudio } from "./guild-audio";

class AudioModule extends Module {
    private guildAudio: Discord.Collection<string, GuildAudio>;

    constructor() {
        super('audio');
        this.guildAudio = new Discord.Collection();
    }

    async init(client: Discord.Client<true>): Promise<void> { }
    async destroy(): Promise<void> { }

    getGuildAudio(guild: Discord.Guild): GuildAudio {
        let guildAudio = this.guildAudio.get(guild.id);

        if(!guildAudio) {
            guildAudio = new GuildAudio(guild);
            this.guildAudio.set(guild.id, guildAudio);
            this.log.debug(`Created GuildAudio: ${guild.name}`);
        }

        return guildAudio;
    }
}

export default new AudioModule();
