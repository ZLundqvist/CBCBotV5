import Discord from 'discord.js';
import { Module, VoiceStateUpdateCustom } from '../../core';
import getLogger from '../../utils/logger';
import * as voice from "../../utils/voice";
import postureCheck from '../posture-check';

const log = getLogger(__dirname)

class AutoJoinModule extends Module {

    private client!: Discord.Client<true>;

    constructor() {
        super('AutoJoin');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.client = client;
        client.on('voiceStateUpdateCustom' as any, (event: VoiceStateUpdateCustom) => {
            this.onVoiceStateUpdate(event);
        });
    }

    /**
     * Function that handles logic that should run when a VoiceState change occurs
     * Does not run when the VoiceState belongs to me
     */
    private onVoiceStateUpdate({ oldState, newState, type }: VoiceStateUpdateCustom) {
        // If state belongs to me
        if(this.client.user.id === newState.member?.user.id)
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
        }
    }

    /**
     * Runs when another member connects to a VC
     * @param state 
     */
    private onConnect(state: Discord.VoiceState) {
        if(state.channel && state.channelId !== state.guild.afkChannelId && state.channel.type === 'GUILD_VOICE') {
            voice.connectIfAloneOrDisconnected(state.channel);
        } else {
            voice.disconnectIfAlone(state.guild);
        }
    }

    /**
     * Runs when another member disconnects from a VC
     * @param state 
     */
    private onDisconnect(state: Discord.VoiceState) {
        if(voice.isAlone(state.guild)) {
            // audio.stop(state.guild);
            postureCheck.disable(state.guild);
            voice.disconnect(state.guild);
        }
    }

    /**
     * Runs when another member transfers from one VC to another(!) VC
     * @param state 
     */
    private onTransfer(state: Discord.VoiceState) {
        if(state.channel && state.channelId !== state.guild.afkChannelId && state.channel.type === 'GUILD_VOICE') {
            voice.connectIfAloneOrDisconnected(state.channel);
        } else {
            voice.disconnectIfAlone(state.guild);
        }
    }
}

export default new AutoJoinModule();
