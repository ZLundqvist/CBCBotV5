import Discord from 'discord.js';
import { CommandError, Module, VoiceStateUpdateCustom } from "../../core";
import ResourceHandler from '../../core/resource-handler';
import { DBGuildUtils } from "../../database/entity/guild";
import { DBMemberUtils } from '../../database/entity/member';
import getLogger from '../../utils/logger';
import audio from '../audio';

const log = getLogger(__dirname);

class EntrySoundModule extends Module {

    private client!: Discord.Client<true>;

    constructor() {
        super('EntrySound');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.client = client;
        client.on('voiceStateUpdateCustom' as any, (event: VoiceStateUpdateCustom) => {
            this.onVoiceStateUpdate(event);
        });
    }

    async setBotEntrySFX(g: Discord.Guild, newSFX: string) {
        if(!ResourceHandler.sfxExists(newSFX)) {
            throw new CommandError(`Invalid SFX: ${newSFX}`);
        }

        const guild = await DBGuildUtils.getGuild(g);
        guild.entrysound = newSFX;
        await guild.save();
    }

    async setMemberEntrySFX(m: Discord.GuildMember, newSFX: string) {
        if(!ResourceHandler.sfxExists(newSFX)) {
            throw new CommandError(`Invalid SFX: ${newSFX}`);
        }

        const member = await DBMemberUtils.getMember(m);
        member.entrysound = newSFX;
        await member.save();
    }

    async getBotEntrySFX(g: Discord.Guild): Promise<string | null> {
        const guild = await DBGuildUtils.getGuild(g);
        return guild.entrysound;
    }

    async getMemberEntrySFX(m: Discord.GuildMember): Promise<string | null> {
        const member = await DBMemberUtils.getMember(m);
        return member.entrysound;
    }

    private async onVoiceStateUpdate({ oldState, newState, type }: VoiceStateUpdateCustom) {
        if(type === 'transfer' || type === 'connect') {
            if(newState.member?.user.id === this.client.user.id) {
                // If event was caused by bot itself
                await this.playBotEntry(newState.guild);
            } else if(newState.member && newState.channelId === newState.guild.me?.voice.channelId) {
                // If event was someone joining my channel
                await this.playMemberEntry(newState.member);
            } else {
                // Someone connected/transferred, but it wasn't TO bot's current channel
            }
        }
    }

    private async playBotEntry(guild: Discord.Guild) {
        const guildDB = await DBGuildUtils.getGuild(guild);

        if(!guildDB.entrysound) {
            log.debug(`No entrysound set: ${guild.name}`);
            return;
        }

        if(!guild.me) {
            return;
        }

        const guildAudio = audio.getGuildAudio(guild);

        if(!guildAudio.isPlaying) {
            await guildAudio.queue(guild.me, guildDB.entrysound, false, false);
        }
    }

    private async playMemberEntry(m: Discord.GuildMember) {
        let member = await DBMemberUtils.getMember(m);

        if(!member.entrysound) {
            log.debug(`No entrysound set: ${member.id}`);
            return;
        }

        const guildAudio = audio.getGuildAudio(m.guild);
        if(!guildAudio.isPlaying) {
            await guildAudio.queue(m, member.entrysound, false, false);
        }
    }
}

export default new EntrySoundModule();
