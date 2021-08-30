import { TwitchSubscription } from "./twitch-subscription";
import audio from '../audio';
import Discord from 'discord.js';
import { HelixUser, HelixStream, ApiClient } from 'twitch';
import { WebHookListener } from "twitch-webhooks/lib";
import getLogger from "../../utils/logger";
import { TwitchLive } from "../../database/entity/twitch-live";

const log = getLogger(__dirname);

export class StreamChangeSubscription extends TwitchSubscription {

    readonly guildId: string;
    prevStream: HelixStream | null = null;

    constructor(client: Discord.Client, apiClient: ApiClient, listener: WebHookListener, user: HelixUser, guildId: string) {
        super(client, apiClient, listener, user);
        this.guildId = guildId;
        log.debug(`StreamChangeSubscription created for channel ${this.user.displayName} in guild ${this.guildId}`);
    }

    async createSubscription() {
        // we need to track the previous status of the stream because there are other state changes than the live/offline switch
        this.prevStream = await this.apiClient.helix.streams.getStreamByUserId(this.user);
        
        return await this.listener.subscribeToStreamChanges(this.user, (stream?: HelixStream) => this.onChange(stream));
    }

    private async onChange(stream?: HelixStream) {
        if(stream) {
            if(!this.prevStream) {
                log.debug(`${stream.userDisplayName} just went live with title: ${stream.title}`);
                this.announce();
            }
        } else {
            log.debug(`${this.user.displayName} just went offline`);
        }
        this.prevStream = stream || null;
    }

    private async announce() {
        const guild = this.client.guilds.resolve(this.guildId);

        if(!guild) {
            log.warn(`Cannot resolve guildId ${this.guildId}`);
            return;
        }

        const systemChannel = guild.systemChannel;

        if(!systemChannel) {
            log.warn(`Guild ${guild.name} has no system channel, can't announce stream`);
            return;
        }

        const info = await TwitchLive.findOne({
            where: {
                guild: guild.id,
                twitch_username: this.user.displayName
            }
        });

        if(guild.me && info?.sfx && !audio.isPlaying(guild) && audio.getQueue(guild).length == 0) {
            audio.play(guild.me, info.sfx);
        }

        systemChannel.send(`${this.user.displayName} is live, POG!`);
    }
}