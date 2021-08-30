import Discord from 'discord.js';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import { Administrator, isAdminInGuild } from '../../database/entity/administrator';
import { Guild } from "../../database/entity/guild";
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

class Administrators extends Module {
    constructor() {
        super('Administrators');
    }

    async init(client: Discord.Client): Promise<void> { }

    async addAdmin(guild: Discord.Guild, user: Discord.User) {
        if(await isAdminInGuild(user, guild)) {
            throw new CommandError(`User ${user} is already an admin`);
        }

        const guildDB = await Guild.findOneOrFail({ 
            where: {
                id: guild.id
            }
        });

        const admin = new Administrator();
        admin.userId = user.id;
        admin.guild = guildDB;
        await admin.save();
    }

    async removeAdmin(guild: Discord.Guild, user: Discord.User) {
        if(!await isAdminInGuild(user, guild)) {
            throw new CommandError(`${user} is not an admin`);
        }

        const admin = await Administrator.findOneOrFail({
            where: {
                userId: user.id,
                guildId: guild.id
            }
        });

        await admin.remove();
    }

    async getAdmins(guild: Discord.Guild): Promise<string[]> {
        const admins = await Administrator.find({
            where: {
                guildId: guild.id
            }
        });

        return await Promise.all(admins.map(async (admin) => (await guild.client.users.fetch(admin.userId)).username));
    }
}


export default new Administrators();