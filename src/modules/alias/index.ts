import Discord from 'discord.js';
import { CommandError, Module } from '../../core';
import { Alias } from '../../database/entity/alias';
import { Guild } from '../../database/entity/guild';
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

    async addInGuild(guildId: string, key: string, value: string) {
        let alias = await Alias.findOne({
            where: {
                guild: guildId,
                key: key
            }
        });

        if(alias) {
            alias.key = key;
            alias.value = value;
        } else {
            alias = new Alias();
            const guildDB = await Guild.findOneOrFail({
                where: {
                    id: guildId
                }
            });

            alias.key = key;
            alias.guild = guildDB;
            alias.value = value;
        }

        await alias.save();
        log.info(`Alias added: ${alias.key} -> ${alias.value}`);
        return alias;
    }

    async removeInGuild(guildId: string, key: string) {
        const alias = await Alias.findOne({
            where: {
                guild: guildId,
                key: key
            }
        });

        if(!alias)
            throw new CommandError(`Alias does not exist: ${key}`);

        await alias.remove();
        log.info(`Alias removed: ${alias.key}`);
    }

    async getAllInGuild(guildId: string): Promise<Alias[]> {
        const aliases = await Alias.find({
            where: {
                guild: guildId
            }
        });

        return aliases;
    }

    private async onMessageCreate(msg: Discord.Message) {
        if(!msg.guild) {
            return;
        }

        if(msg.author.id === msg.client.user?.id) {
            return;
        }

        const alias = await Alias.findOne({
            where: {
                guild: msg.guild.id,
                key: msg.content.trim()
            }
        });

        if(alias) {
            await msg.channel.send(alias.value);
            await msg.delete();
        }
    }
}


export default new AliasModule();
