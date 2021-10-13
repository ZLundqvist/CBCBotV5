import Discord from 'discord.js';
import { BotCore, CommandError, Module } from '../../core';
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

class AliasModule extends Module {
    constructor() {
        super('Alias');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        client.on('messageCreate', (msg: Discord.Message) => {
            this.onMessageCreate(msg);
        });
    }

    async destroy(): Promise<void> { }

    async addInGuild(guild: Discord.Guild, key: string, value: string) {
        let alias = await BotCore.database.getAlias(guild, key);

        if(alias) {
            alias.key = key;
            alias.value = value;
        } else {
            alias = await BotCore.database.buildAlias(guild, key, value);
        }

        await alias.save();
        log.info(`Alias added: ${alias.key} -> ${alias.value}`);
        return alias;
    }

    async removeInGuild(guild: Discord.Guild, key: string) {
        const alias = await BotCore.database.getAlias(guild, key);

        if(!alias)
            throw new CommandError(`Alias does not exist: ${key}`);

        await alias.remove();
        log.info(`Alias removed: ${alias.key}`);
    }

    async getAllInGuild(guild: Discord.Guild) {
        return await BotCore.database.getGuildAliases(guild);
    }

    private async onMessageCreate(msg: Discord.Message) {
        if(!msg.client.isReady()) {
            return;
        }
        
        if(!msg.guild) {
            return;
        }

        if(msg.author.id === msg.client.user.id) {
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
