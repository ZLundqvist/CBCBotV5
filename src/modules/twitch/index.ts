import Discord from 'discord.js';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import config from '../../utils/config';
import getLogger from '../../utils/logger';
import { ApiClient, HelixUser, HelixStream } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';
import { WebHookListener, Subscription, SimpleAdapter } from 'twitch-webhooks';
import { TwitchLive } from '../../database/entity/twitch-live';
import { Guild } from '../../database/entity/guild';
import { StreamChangeSubscription } from './stream-change-subscription';
import { isDev } from '../../utils/utils';
import { NgrokAdapter } from 'twitch-webhooks-ngrok';
import resourceHandler from '../../core/resource-handler';

const log = getLogger(__dirname);

class Twitch extends Module {

    private client!: Discord.Client;
    private activeSubscribers: StreamChangeSubscription[] = [];
    private listener: WebHookListener | null = null;
    private apiClient: ApiClient | null = null;

    constructor() {
        super('Twitch');
    }

    async init(client: Discord.Client): Promise<void> {
        this.client = client;
        await this.createListener();
        await this.createSubscribers();
    }

    async removeSubscription(guild: Discord.Guild, username: string): Promise<void> {
        const user = await this.getTwitchUserFromName(username);
        if(!user) throw new CommandError(`${username} is not a valid twitch username`);

        const item = await TwitchLive.findOne({
            where: {
                guild: guild.id,
                twitch_username: user.displayName
            },
            relations: ['guild']
        });

        if(!item) throw new CommandError(`Not subscribed to channel ${user.displayName}`);

        await item.remove();

        // Disable subscription and remove from active array
        const activeItem = this.activeSubscribers.find(s => s.guildId === item.guild.id && s.user.displayName === item.twitch_username);
        if(activeItem) {
            activeItem.subscription?.stop();

            const indexOf = this.activeSubscribers.indexOf(activeItem);
            this.activeSubscribers.splice(indexOf, 1);
        }
    }

    async getSubscriptions(guild: Discord.Guild) {
        const items = await TwitchLive.find({
            where: {
                guild: guild.id
            },
            relations: ['guild']
        });

        return items.map(i => {
            const isActive = this.activeSubscribers.find(s => i.guild.id === s.guildId && i.twitch_username === s.user.displayName);

            return {
                name: i.twitch_username,
                isActive: isActive ? isActive.subscription?.verified : false,
                sfx: i.sfx
            } as { name: string, isActive: boolean, sfx?: string };
        });
    }

    async addSubscription(guild: Discord.Guild, twitchUsername: string, sfx?: string) {
        const guildDb = await Guild.findOneOrFail({
            where: {
                id: guild.id
            }
        });

        const user = await this.getTwitchUserFromName(twitchUsername);
        if(!user) throw new CommandError(`${twitchUsername} is not a valid twitch username`);

        const exists = await TwitchLive.findOne({
            where: {
                guild: guildDb,
                twitch_username: user.displayName
            }
        });

        if(exists) {
            throw new CommandError("Already subscribed to channel: " + user.displayName);
        }

        if(sfx && !resourceHandler.sfxExists(sfx)) {
            throw new CommandError(`SFX does not exist: ${sfx}`);
        }

        // Save item to db
        const newSubscription = new TwitchLive();
        newSubscription.guild = guildDb;
        newSubscription.twitch_username = user.displayName;
        if(sfx) newSubscription.sfx = sfx;

        await newSubscription.save();

        // Create the subscriber instance
        this.createSubscriber(guildDb.id, user);
    }

    private async createListener() {
        const clientId = config.getConfigValue('twitch-client-id');
        const clientSecret = config.getConfigValue('twitch-client-secret');

        const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
        this.apiClient = new ApiClient({ authProvider });

        let adapter;
        let listener;
        if(isDev()) {
            adapter = new NgrokAdapter();
            listener = new WebHookListener(this.apiClient, adapter, { hookValidity: 60 });
            log.debug(`Twitch webhook server running in development mode using ngrok: ${await adapter.getHostName()}:${await adapter.getExternalPort()}`);
        } else {
            adapter = new SimpleAdapter({
                hostName: 'zackiboy.lha.sgsnet.se',
                listenerPort: 8090
            });
            listener = new WebHookListener(this.apiClient, adapter);
            log.debug(`Twitch webhook server listening on port ${await adapter.getListenerPort()}`);
        }
        await listener.listen();

        this.listener = listener;
    }

    private async getTwitchUserFromName(username: string) {
        if(!this.apiClient) {
            log.warn('getTwitchUserFromName without active apiClient');
            return null;
        }

        return await this.apiClient.helix.users.getUserByName(username);
    }

    /**
     * Create a subscriber instance for every row in TwitchLive table. Use only use on start
     */
    private async createSubscribers() {
        const items = await TwitchLive.find({
            relations: ['guild']
        });

        for(const item of items) {
            const user = await this.getTwitchUserFromName(item.twitch_username);
            if(!user) {
                log.debug(`Stream ${item.twitch_username} is no longer valid, ignoring...`);
                continue;
            }

            this.createSubscriber(item.guild.id, user);
        }
    }

    private createSubscriber(guildId: string, user: HelixUser) {
        if(!this.listener || !this.apiClient) {
            log.warn('Tried to subscribe without active listener or api client');
            return null;
        }

        const subscriber = new StreamChangeSubscription(this.client, this.apiClient, this.listener, user, guildId);
        this.activeSubscribers.push(subscriber);
        return subscriber;
    }

}

export default new Twitch();