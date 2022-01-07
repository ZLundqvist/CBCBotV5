import Discord from 'discord.js';
import { Module } from '../../core';
import * as VoiceUtil from "../../utils/voice";
import PostureCheck from '../posture-check';

class AutoJoinModule extends Module {
    private client!: Discord.Client<true>;

    constructor() {
        super('auto-join');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.client = client;
        client.on('voiceStateUpdate', (oldState, newState) => {
            this.onVoiceStateUpdate(oldState, newState);
        });
    }

    async destroy(): Promise<void> { }

    /**
     * Function that handles logic that should run when a VoiceState change occurs
     * Does not run when the VoiceState belongs to me
     */
    private onVoiceStateUpdate(oldState: Discord.VoiceState, newState: Discord.VoiceState) {
        // If state belongs to me
        if(this.client.user.id === newState.member?.user.id)
            return;

        const type = VoiceUtil.getVoiceStateUpdateType(oldState, newState);

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
     * @param newState 
     */
    private onConnect(newState: Discord.VoiceState) {
        if(newState.channel && !VoiceUtil.isAFKChannel(newState.channel)) {
            VoiceUtil.connectIfAloneOrDisconnected(newState.channel);
        } else {
            VoiceUtil.disconnectIfAlone(newState.guild);
        }
    }

    /**
     * Runs when another member disconnects from a VC
     * @param newState 
     */
    private onDisconnect(newState: Discord.VoiceState) {
        if(VoiceUtil.isAlone(newState.guild)) {
            PostureCheck.disable(newState.guild);
            VoiceUtil.disconnect(newState.guild);
        }
    }

    /**
     * Runs when another member transfers from one VC to another(!) VC
     * @param newState 
     */
    private onTransfer(newState: Discord.VoiceState) {
        if(newState.channel && !VoiceUtil.isAFKChannel(newState.channel)) {
            VoiceUtil.connectIfAloneOrDisconnected(newState.channel);
        } else {
            VoiceUtil.disconnectIfAlone(newState.guild);
        }
    }
}

export default new AutoJoinModule();
