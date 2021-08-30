import Discord from 'discord.js';
import { VoiceStateUpdateCustom } from "../../core/custom-events";
import { Module } from "../../core/module";
import getLogger from '../../utils/logger';
import { connectIfAloneOrDisconnected, disconnectIfAlone, isAlone, disconnect } from "../../utils/voice";
import audio from '../audio';
import postureCheck from '../posture-check';

const log = getLogger(__dirname)

class AutoJoin extends Module {
    constructor() {
        super('AutoJoin');
    }

    async init(client: Discord.Client): Promise<void> {
        client.on('voiceStateUpdateCustom' as any, (event: VoiceStateUpdateCustom) => {
            this.onVoiceStateUpdate(event);
        });
    }

    private onVoiceStateUpdate({ oldState, newState, type }: VoiceStateUpdateCustom) {
        if(newState.client.user?.id === newState.member?.user.id)
            return;

        switch(type) {
            case 'connect':
                this.onConnect(newState);
                break;
            case 'disconnect':
                this.onDisconnect(newState);
                break;
            case 'transfer':
                this.onTransfer(newState);
                break;
            default:
                log.warn(`No event type??\n${JSON.stringify(oldState)}\n${JSON.stringify(newState)}`);
        }
    }

    private onConnect(state: Discord.VoiceState) {
        if(state.channel && state.channelID !== state.guild.afkChannelID) {
            connectIfAloneOrDisconnected(state.channel);
        } else {
            disconnectIfAlone(state.guild);
        }       
    }

    private onDisconnect(state: Discord.VoiceState) {
        if(isAlone(state.guild)) {
            audio.stop(state.guild);
            postureCheck.disable(state.guild);
            disconnect(state.guild);
        }
    }

    private onTransfer(state: Discord.VoiceState) {
        if(state.channel && state.channelID !== state.guild.afkChannelID) {
            connectIfAloneOrDisconnected(state.channel);
        } else {
            disconnectIfAlone(state.guild);
        }      
    }
}

export default new AutoJoin();