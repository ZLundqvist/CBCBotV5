import Discord from 'discord.js';
import { CommandError } from '../../core/command-error';
import { VoiceStateUpdateCustom } from "../../core/custom-events";
import { Module } from "../../core/module";
import ResourceHandler from '../../core/resource-handler';
import { Guild } from "../../database/entity/guild";
import { getMember } from '../../database/entity/member';
import getLogger from '../../utils/logger';
import sleep from "../../utils/sleep";
import audio from "../audio";

const log = getLogger(__dirname);

class EntrySound extends Module {
    
    constructor() {
        super('EntrySound');
    }

    async init(client: Discord.Client): Promise<void> {
        client.on('voiceStateUpdateCustom' as any, (event: VoiceStateUpdateCustom) => {
            this.onVoiceStateUpdate(event);
        });
    }

    async setBotEntrySFX(g: Discord.Guild, newSFX: string) {
        if(!ResourceHandler.sfxExists(newSFX)) {
            throw new CommandError(`Invalid sfx: ${newSFX}`);
        }

        const guild = await Guild.findOneOrFail(g.id);
        guild.entrysound = newSFX;
        await guild.save();
    }

    async setMemberEntrySFX(m: Discord.GuildMember, newSFX: string) {
        if(!ResourceHandler.sfxExists(newSFX)) {
            throw new CommandError(`Invalid sfx: ${newSFX}`);
        }

        const member = await getMember(m);
        member.entrysound = newSFX;
        await member.save();
    }

    async getBotEntrySFX(g: Discord.Guild): Promise<string | null> {
        const guild = await Guild.findOneOrFail(g.id);
        return guild.entrysound;
    }

    async getMemberEntrySFX(m: Discord.GuildMember): Promise<string | null> {
        const member = await getMember(m);
        return member.entrysound;
    }

    private async onVoiceStateUpdate({ oldState, newState, type }: VoiceStateUpdateCustom) {
        if(type === 'disconnect') 
            return;

        // Edge case. If someone transfers into the same channel
        // This happens when someone changes state in the current VC
        // i.e. they start/stop streaming video (go live)
        if(type === 'transfer' && oldState.channelID === newState.channelID)
            return;
        
        if(newState.member?.user.id === newState.client.user?.id) {
            // If event was caused by bot itself
            await this.playBotEntry(newState.guild);
        } else if(newState.member && newState.channelID === newState.guild.voice?.channelID) {
            // If event was someone joining my channel
            await this.playMemberEntry(newState.member);
        } else {
            // Someone connected/transferred, but it wasn't TO bot's current channel
        }
    }

    private async playBotEntry(guild: Discord.Guild) {
        let guildDB = await Guild.findOneOrFail(guild.id);

        if(!guildDB.entrysound) {
            log.debug(`No entrysound set: ${guild.name}`);
            return;
        }

        if(!guild.me) {
            log.warn(`No guild.me when joining channel?`);
            return;
        }

        await sleep(1000);
        if(!audio.isPlaying(guild)) {
            await audio.play(guild.me, guildDB.entrysound);
        }
    }

    private async playMemberEntry(m: Discord.GuildMember) {
        let member = await getMember(m);

        if(!member.entrysound) {
            log.debug(`No entrysound set: ${member.id}`);
            return;
        }

        if(!m.guild.me) {
            log.warn(`No guild.me when user joined my channel?`);
            return;
        }

        await sleep(500);   // arbitrary
        if(!audio.isPlaying(m.guild)) {
            await audio.play(m.guild.me, member.entrysound);
        }
    }
}

export default new EntrySound();