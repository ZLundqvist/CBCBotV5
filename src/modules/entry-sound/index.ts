import Discord from 'discord.js';
import { BotCore, CommandError, Module } from "../../core";
import * as VoiceUtil from '../../utils/voice';
import audio from '../audio';

class EntrySoundModule extends Module {
    private client!: Discord.Client<true>;

    constructor() {
        super('entry-sound');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.client = client;
        client.on('voiceStateUpdate', (oldState, newState) => {
            this.onVoiceStateUpdate(oldState, newState);
        });
    }

    async destroy(): Promise<void> { }

    async setBotEntrySFX(g: Discord.Guild, newSFX: string) {
        if(!BotCore.resources.getSFX(newSFX)) {
            throw new CommandError(`Invalid SFX: ${newSFX}`);
        }

        const guild = await BotCore.database.getGuild(g);
        guild.entrysound = newSFX;
        await guild.save();
    }

    async setMemberEntrySFX(m: Discord.GuildMember, newSFX: string) {
        if(!BotCore.resources.getSFX(newSFX)) {
            throw new CommandError(`Invalid SFX: ${newSFX}`);
        }

        const member = await BotCore.database.getMember(m);
        member.entrysound = newSFX;
        await member.save();
    }

    async getBotEntrySFX(g: Discord.Guild): Promise<string | null> {
        const guild = await BotCore.database.getGuild(g);
        return guild.entrysound;
    }

    async getMemberEntrySFX(m: Discord.GuildMember): Promise<string | null> {
        const member = await BotCore.database.getMember(m);
        return member.entrysound;
    }

    private async onVoiceStateUpdate(oldState: Discord.VoiceState, newState: Discord.VoiceState) {
        const type = VoiceUtil.getVoiceStateUpdateType(oldState, newState);

        if(type === 'transfer' || type === 'connect') {
            if(newState.member?.user.id === this.client.user.id) {
                // If event was caused by bot itself
                await this.playBotEntry(newState.guild);
            } else if(newState.member && newState.channelId === newState.guild.members.me?.voice.channelId) {
                // If event was someone joining my channel
                await this.playMemberEntry(newState.member);
            } else {
                // Someone connected/transferred, but it wasn't TO bot's current channel
            }
        }
    }

    private async playBotEntry(guild: Discord.Guild) {
        const guildDB = await BotCore.database.getGuild(guild);

        if(!guildDB.entrysound) {
            this.log.debug(`No entrysound set: ${guild.name}`);
            return;
        }

        if(!guild.members.me) {
            return;
        }

        const guildAudio = audio.getGuildAudio(guild);

        if(!guildAudio.isPlaying) {
            try {
                await guildAudio.smartQueue(guildDB.entrysound, guild.members.me, false);
            } catch(error: any) {
                this.log.warn(`Unable to queue bot entry: ${error.message}`);
            }
        }
    }

    private async playMemberEntry(m: Discord.GuildMember) {
        let member = await BotCore.database.getMember(m);

        if(!member.entrysound) {
            this.log.debug(`No entrysound set: ${m.displayName}`);
            return;
        }

        const guildAudio = audio.getGuildAudio(m.guild);
        if(!guildAudio.isPlaying) {
            try {
                await guildAudio.smartQueue(member.entrysound, m, false);
            } catch(error: any) {
                this.log.warn(`Unable to queue member entry: ${error.message}`);
            }
        }
    }
}

export default new EntrySoundModule();
