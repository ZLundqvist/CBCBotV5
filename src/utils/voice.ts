import * as DiscordVoice from '@discordjs/voice';
import Discord, { Guild } from 'discord.js';
import getLogger from './logger';

const log = getLogger('Voice');

export type VoiceUpdateTypes = 'connect' | 'disconnect' | 'transfer' | 'stateChange';

export function inVoiceChannel(guild: Discord.Guild): boolean {
    return !!DiscordVoice.getVoiceConnection(guild.id);
}

export function membersInMyVoiceChannel(guild: Discord.Guild): number {
    const vc = DiscordVoice.getVoiceConnection(guild.id);
    if(!vc) {
        return 0;
    }

    const clientVoiceChannel = guild.me?.voice.channel;
    if(!clientVoiceChannel) {
        return 0;
    }

    return clientVoiceChannel.members.size;
}

export async function disconnect(guild: Discord.Guild) {
    DiscordVoice.getVoiceConnection(guild.id)?.destroy();
    log.debug('Disconnect: ' + guild.name);
}

export async function connect(channel: Discord.VoiceChannel | Discord.StageChannel): Promise<DiscordVoice.VoiceConnection> {
    log.debug('Connect: ' + channel.name);
    const connection = DiscordVoice.joinVoiceChannel({
        guildId: channel.guildId,
        channelId: channel.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    await DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Ready, 5000);
    return connection;
}

export function isAlone(guild: Discord.Guild): boolean {
    return membersInMyVoiceChannel(guild) === 1;
}

export function disconnectIfAlone(guild: Discord.Guild) {
    if(isAlone(guild)) {
        disconnect(guild);
    }
}

export async function connectIfAloneOrDisconnected(vc: Discord.VoiceChannel | Discord.StageChannel) {
    if(membersInMyVoiceChannel(vc.guild) <= 1) {
        await connect(vc);
    }
}

/**
 * Checks and returns true if the client is in the same voice channel as the passed guildmember
 * false otherwise
 */
export function inSameChannelAs(member: Discord.GuildMember): boolean {
    // If i'm not connected
    if(!inVoiceChannel(member.guild)) {
        return false;
    }

    // If member is not connected
    if(!member.voice.channel) {
        return false;
    }

    const vc = DiscordVoice.getVoiceConnection(member.guild.id);

    // If my voicechannel is not the same as the members voicechannel
    return vc?.joinConfig.channelId === member.voice.channelId
}

export function getVoiceUpdateType(oldState: Discord.VoiceState, newState: Discord.VoiceState): VoiceUpdateTypes {
    const oldVC = oldState.channel;
    const newVC = newState.channel;

    if(oldVC && !newVC) {
        return 'disconnect';
    } else if(!oldVC && newVC) {
        return 'connect';
    } else if(oldVC && newVC && oldVC.id !== newVC.id) {
        return 'transfer';
    } else {
        // A stateChange is when a user changes their state but remains in the same voicechannel,
        // e.g. when a user mutes/unmutes itself
        return 'stateChange';
    }
}
