import * as DiscordVoice from '@discordjs/voice';
import Discord from 'discord.js';
import { getLoggerWrapper } from './logger';

const log = getLoggerWrapper('voice');

type VoiceStateUpdateTypes = 'connect' | 'disconnect' | 'transfer' | 'stateChange';

/**
 * Returns true if bot is connected to a VoiceChannel in the given guild
 */
export function inVoiceChannel(guild: Discord.Guild): boolean {
    return !!guild.members.me?.voice.channelId;
}

/**
 * Returns the number of members connected to the same VoiceChannel as the bot in the given guild.
 * Returns 0 if bot is currently disconnected
 */
export function membersInMyVoiceChannel(guild: Discord.Guild): number {
    const currentVoiceChannel = guild.members.me?.voice.channel;
    // If no VoiceState exists for the client user in the guild
    // That means we have either not yet joined the guild or that we are not connected to any channel
    if(!currentVoiceChannel) {
        return 0;
    }

    return currentVoiceChannel.members.size;
}

/**
 * Disconnects from VoiceChannel in the given guild, if connected to one. 
 */
export function disconnect(guild: Discord.Guild) {
    const vc = DiscordVoice.getVoiceConnection(guild.id);
    if(vc) {
        vc.destroy();
        log.info(`Disconnected (guild: ${guild.name})`);
    } else {
        log.debug(`Disconnect failed (guild: ${guild.name}, reason: not connected)`);
    }
}

/**
 * Connect to the given VoiceChannel.
 * Waits 5 seconds for the connection to become ready. Throws error if connection cannot be made within that time.
 */
export async function connect(channel: Discord.VoiceBasedChannel): Promise<DiscordVoice.VoiceConnection> {
    const connection = DiscordVoice.joinVoiceChannel({
        guildId: channel.guildId,
        channelId: channel.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any // https://discord.com/channels/222078108977594368/852128888128929802/896644850898841610
    });
    await DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Ready, 5000);

    log.info(`Connected (guild: ${channel.guild.name}, channel: ${channel.name})`);
    return connection;
}

/**
 * Returns true if bot is alone in a VoiceChannel in the given guild.
 */
export function isAlone(guild: Discord.Guild): boolean {
    return membersInMyVoiceChannel(guild) === 1;
}

export function disconnectIfAlone(guild: Discord.Guild) {
    if(isAlone(guild)) {
        disconnect(guild);
    }
}

export async function connectIfAloneOrDisconnected(vc: Discord.VoiceBasedChannel) {
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
    return member.guild.members.me?.voice.channelId === member.voice.channelId;
}

/**
 * Returns true if the given VoiceChannel
 */
export function isAFKChannel(vc: Discord.VoiceBasedChannel): boolean {
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

/**
 * 
 * @param oldState 
 * @param newState 
 * @returns 
 */
export function logVoiceStateUpdate(oldState: Discord.VoiceState, newState: Discord.VoiceState): void {
    const clientUser = newState.client.user;
    const member = newState.member;

    if(!clientUser || !member) return;

    // Do not log update if it was the bot that triggered the update
    if(clientUser.id === member.id) return;

    const type = getVoiceStateUpdateType(oldState, newState);
    switch(type) {
        case 'connect':
            log.info(`User connect (user: ${newState.member?.displayName}, guild: ${newState.guild.name}, channel: ${newState.channel?.name})`);
            break;
        case 'disconnect':
            log.info(`User disconnect (user: ${newState.member?.displayName}, guild: ${newState.guild.name}, channel: ${oldState.channel?.name})`);
            break;
        case 'transfer':
            log.info(`User transfer (user: ${newState.member?.displayName}, guild: ${newState.guild.name}, old_channel: ${oldState.channel?.name}, new_channel: ${newState.channel?.name})`);
            break;
    }
}
