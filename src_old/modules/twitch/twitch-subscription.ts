import Discord from 'discord.js';
import { WebHookListener, Subscription } from 'twitch-webhooks/lib';
import { HelixUser, ApiClient } from 'twitch/lib';

export abstract class TwitchSubscription {
    readonly client: Discord.Client;
    readonly apiClient: ApiClient;
    readonly listener: WebHookListener;
    readonly user: HelixUser;

    subscription?: Subscription<any>;

    constructor(client: Discord.Client, apiClient: ApiClient, listener: WebHookListener, user: HelixUser) {
        this.client = client;
        this.apiClient = apiClient;
        this.listener = listener
        this.user = user;

        this.subscribe();
    }

    private async subscribe() {
        this.subscription = await this.createSubscription();
    }

    abstract async createSubscription(): Promise<Subscription>;
}