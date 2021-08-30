import Discord from 'discord.js';
import { CommandError } from '../../core/command-error';
import { Module } from "../../core/module";
import { Administrator, isAdminInGuild } from '../../database/entity/administrator';
import { Guild } from "../../database/entity/guild";
import getLogger from '../../utils/logger';
import { Member } from '../../database/entity/member';

const log = getLogger(__dirname);

class Members extends Module {
    constructor() {
        super('Members');
    }

    async init(client: Discord.Client): Promise<void> { }

    async updateNames(guild: Discord.Guild): Promise<number> {
        const guildDB = await Guild.findOne(guild.id);
        const membersDB = await Member.find({
            where: {
                guild: guildDB
            }
        });

        let updateCount = 0;
        const members = membersDB.map(memberDB => guild.members.resolve(memberDB.id)).filter(x => x);
        for(const member of members) {
            if(!member)
                continue;

            const memberDB = membersDB.find(memberDB => memberDB.id === member.id);

            if(memberDB) {
                memberDB.name = member.displayName;
                await memberDB.save();
                updateCount++;
            }
        }

        log.info(`Updated ${updateCount} members in: ${guild.name}`);
        return updateCount;
    }
}


export default new Members();