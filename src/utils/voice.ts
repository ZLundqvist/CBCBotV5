import * as DiscordVoice from '@discordjs/voice';
import Discord from 'discord.js';
import { getLoggerWrapper } from './logger';

const log = getLoggerWrapper('util/voice');

export type VoiceStateUpdateTypes = 'connect' | 'disconnect' | 'transfer' | 'stateChange';

export function inVoiceChannel(guild: Discord.Guild): boolean {
    return !!guild.me?.voice.channelId;
}

export function membersInMyVoiceChannel(guild: Discord.Guild): number {
    const currentVoiceChannel = guild.me?.voice.channel;
    // If no VoiceState exists for the client user in the guild
    // That means we have either not yet joined the guild or that we are not connected to any channel
    if(!currentVoiceChannel) {
        return 0;
    }

    return currentVoiceChannel.members.size;
}

export function disconnect(guild: Discord.Guild) {
    const vc = DiscordVoice.getVoiceConnection(guild.id);
    if(vc) {
        vc.destroy();
        log.info(`Disconnected (guild: ${guild.name})`);
    } else {
        log.debug(`Disconnect failed (guild: ${guild.name}, reason: not connected)`);
    }
}

export async function connect(channel: Discord.BaseGuildVoiceChannel): Promise<DiscordVoice.VoiceConnection> {
    const connection = DiscordVoice.joinVoiceChannel({
        guildId: channel.guildId,
        channelId: channel.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any // https://discord.com/channels/222078108977594368/852128888128929802/896644850898841610
    });
    await DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Ready, 5000);

    log.info(`Connected (guild: ${channel.guild.name}, channel: ${channel.name})`);
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

export async function connectIfAloneOrDisconnected(vc: Discord.BaseGuildVoiceChannel) {
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

    // If my voicechannel is the same as the members voicechannel
    return member.guild.me?.voice.channelId === member.voice.channelId;
}

export function isAFKChannel(vc: Discord.BaseGuildVoiceChannel): boolean {
    return vc.guild.afkChannelId === vc.id;
}

export function getVoiceStateUpdateType(oldState: Discord.VoiceState, newState: Discord.VoiceState): VoiceStateUpdateTypes {
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
