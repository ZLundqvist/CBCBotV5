import getLogger from '@utils/logger';
import { getVoiceUpdateType, VoiceUpdateTypes } from '@utils/voice';
import Discord from 'discord.js';

const log = getLogger('voice');

export interface VoiceStateUpdateCustom {
    oldState: Discord.VoiceState;
    newState: Discord.VoiceState;
    type: VoiceUpdateTypes;
}

export function attachCustomEvents(client: Discord.Client<true>): void {
    attachVoiceStateUpdateTypeListener(client);
}

function attachVoiceStateUpdateTypeListener(client: Discord.Client<true>): void {
    client.on('voiceStateUpdate', (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {
        const type = getVoiceUpdateType(oldState, newState);

        // Only log update if was not bot that moved to reduce log spam
        if(newState.client.user?.id !== newState.member?.user.id) {
            if(type === 'connect') {
                log.debug(`User connect (user: ${newState.member?.displayName}, guild: ${newState.guild.name}, channel: ${newState.channel?.name})`);
            } else if(type === 'disconnect') {
                log.debug(`User disconnect (user: ${newState.member?.displayName}, guild: ${newState.guild.name}, channel: ${oldState.channel?.name})`);
            } else if(type === 'transfer') {
                log.debug(`User transfer (user: ${newState.member?.displayName}, guild: ${newState.guild.name}, old_channel: ${oldState.channel?.name}, new_channel: ${newState.channel?.name})`);
            }
        }

        client.emit('voiceStateUpdateCustom' as any, { oldState, newState, type } as VoiceStateUpdateCustom);
    });
}

