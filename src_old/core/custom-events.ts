import Discord from 'discord.js';
import getLogger from '../utils/logger';
import { getVoiceUpdateType, VoiceUpdateTypes } from '../utils/voice';
const log = getLogger(__dirname);

export function attachCustomEvents(client: Discord.Client) {
    attachVoiceUpdateType(client);
}

function attachVoiceUpdateType(client: Discord.Client) {
    client.on('voiceStateUpdate', (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {
        const type = getVoiceUpdateType(oldState, newState);

        // Only log update if was not bot that moved to reduce log spam
        if(newState.client.user?.id !== newState.member?.user.id) {
            log.debug(`user ${type}: ${newState.member?.displayName}`);
        }

        client.emit('voiceStateUpdateCustom' as any, { oldState, newState, type } as VoiceStateUpdateCustom);
    });
}

export interface VoiceStateUpdateCustom {
    oldState: Discord.VoiceState;
    newState: Discord.VoiceState;
    type: VoiceUpdateTypes;
}