import Discord from 'discord.js';
import { BotCore, CommandError, Module } from '../../core';
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

class AliasModule extends Module {
    private client!: Discord.Client<true>;

    constructor() {
        super('Alias');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        client.on('messageCreate', (msg: Discord.Message) => {
            this.onMessageCreate(msg);
        });

        this.client = client;
    }

    async destroy(): Promise<void> { }

    async addInGuild(guild: Discord.Guild, key: string, value: string) {
        let alias = await BotCore.database.getAlias(guild, key);

        if(alias) {
            const oldValue = alias.value;
            alias.value = value;
            log.info(`Alias value updated: ${oldValue} -> ${alias.value}`);
        } else {
            alias = await BotCore.database.buildAlias(guild, key, value);
            log.info(`Alias added: ${alias.key} -> ${alias.value}`);
        }

        await alias.save();
        return alias;
    }

    async removeInGuild(guild: Discord.Guild, key: string) {
        const alias = await BotCore.database.getAlias(guild, key);

        if(!alias)
            throw new CommandError(`Alias does not exist: ${key}`);

        await alias.remove();
        log.info(`Alias removed: ${alias.key}`);
    }

    private async onMessageCreate(msg: Discord.Message) {        
        if(!msg.guild) {
            return;
        }

        if(msg.author.id === this.client.user.id) {
            return;
        }

        const alias = await BotCore.database.getAlias(msg.guild, msg.content.trim());

        if(alias) {
            await msg.channel.send(alias.value);
            await msg.delete();
        }
    }
}

export default new AliasModule();
