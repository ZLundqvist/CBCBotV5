import Discord from 'discord.js';
import getLogger from './logger';
import { getVoiceConnection, joinVoiceChannel, VoiceConnection } from '@discordjs/voice';

const log = getLogger(__filename);

export type VoiceUpdateTypes = 'connect' | 'disconnect' | 'transfer';

export function inVoiceChannel(guild: Discord.Guild): boolean {
    return !!getVoiceConnection(guild.id)
}

export function membersInMyVoiceChannel(guild: Discord.Guild): number {
    const vc = getVoiceConnection(guild.id);

    if(!vc) {
        return 0;
    }

    return guild.voiceStates.cache.filter((state) => {
        return vc.joinConfig.channelId === state.channelId;
    }).size
}

export function disconnect(guild: Discord.Guild) {
    log.debug('disconnect::' + guild.name);
    getVoiceConnection(guild.id)?.disconnect();
}

export async function connect(vc: Discord.VoiceChannel) {
    log.debug('connect::' + vc.name);
    joinVoiceChannel({
        guildId: vc.guildId,
        channelId: vc.id,
        adapterCreator: vc.guild.voiceAdapterCreator,

    })
}

export function isAlone(guild: Discord.Guild): boolean {
    return membersInMyVoiceChannel(guild) === 1;
}

export function disconnectIfAlone(guild: Discord.Guild) {
    if(isAlone(guild)) {
        disconnect(guild);
    }
}

export async function connectIfAloneOrDisconnected(vc: Discord.VoiceChannel) {
    if(membersInMyVoiceChannel(vc.guild) <= 1) {
        await connect(vc);
    }
}

export function inSameChannelAs(member: Discord.GuildMember): boolean {
    // If i'm not connected
    if(!inVoiceChannel(member.guild)) {
        return false;
    }

    // If member is not connected
    if(!member.voice.channel) {
        return false;
    }

    const vc = getVoiceConnection(member.guild.id);
    // If my voicechannel is not the same as the members voicechannel
    if(vc?.joinConfig.channelId !== member.voice.channelId) {
        return false;
    }

    return true;
}

export function getVoiceUpdateType(oldState: Discord.VoiceState, newState: Discord.VoiceState): VoiceUpdateTypes {
    const oldVC = oldState.channel;
    const newVC = newState.channel;

    if(oldVC && !newVC) {
        return 'disconnect';
    } else if(!oldVC && newVC) {
        return 'connect';
    } else {
        return 'transfer';
    }
}
