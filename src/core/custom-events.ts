import getLogger from '@utils/logger';
import { getVoiceUpdateType, VoiceUpdateTypes } from '@utils/voice';
import Discord from 'discord.js';

const log = getLogger('core');

export interface VoiceStateUpdateCustom {
    oldState: Discord.VoiceState;
    newState: Discord.VoiceState;
    type: VoiceUpdateTypes;
}

export function attachCustomEvents(client: Discord.Client<true>): void {
    attachVoiceUpdateType(client);
}

function attachVoiceUpdateType(client: Discord.Client<true>): void {
    client.on('voiceStateUpdate', (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {
        const type = getVoiceUpdateType(oldState, newState);

        // Only log update if was not bot that moved to reduce log spam
        if(newState.client.user?.id !== newState.member?.user.id) {
            log.debug(`user ${type}: ${newState.member?.displayName}`);
        }

        client.emit('voiceStateUpdateCustom' as any, { oldState, newState, type } as VoiceStateUpdateCustom);
    });
}

