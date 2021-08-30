import Discord from 'discord.js';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import { Alias as AliasDB } from "../../database/entity/alias";
import { getGuildPrefix, Guild } from "../../database/entity/guild";
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

class Alias extends Module {
    constructor() {
        super('Alias');
    }

    async init(client: Discord.Client): Promise<void> {
        client.on('message', (msg: Discord.Message) => {
            this.processMessage(msg);
        });
    }

    async addInGuild(guild: Discord.Guild, key: string, value: string): Promise<AliasDB> {
        let alias = await AliasDB.findOne({
            where: {
                guild: guild.id,
                key: key
            }
        });

        if(alias) {
            alias.key = key;
            alias.value = value;
        } else {
            alias = new AliasDB();
            const guildDB = await Guild.findOneOrFail({
                where: {
                    id: guild.id
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

    async removeInGuild(guild: Discord.Guild, key: string) {
        const alias = await AliasDB.findOne({
            where: {
                guild: guild.id,
                key: key
            }
        });

        if(!alias)
            throw new CommandError(`Alias does not exist: ${key}`);

        await alias.remove();
        log.info(`Alias removed: ${alias.key}`);
    }

    async getAllInGuild(guild: Discord.Guild): Promise<AliasDB[]> {
        const aliases = await AliasDB.find({
            where: {
                guild: guild.id
            }
        });

        return aliases;
    }

    private async processMessage(msg: Discord.Message) {
        if(!msg.guild) {
            return;
        }

        if(msg.author.id === msg.client.user?.id) {
            return;
        }

        const prefix = await getGuildPrefix(msg.guild);
        const alias = await AliasDB.findOne({
            where: {
                guild: msg.guild.id,
                key: msg.content.substr(prefix.length)
            }
        });

        if(!alias) {
            return;
        }

        await msg.channel.send(alias.value);
    }
}


export default new Alias();