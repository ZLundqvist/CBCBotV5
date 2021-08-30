import Discord from 'discord.js';
import { Module } from "../../core/module";
import { getGuildPrefix } from "../../database/entity/guild";
import { MemberStats as MemberStatsDB } from "../../database/entity/member-stats";
import getLogger from '../../utils/logger';
import { getMember } from '../../database/entity/member';

const log = getLogger(__dirname);

class MemberStats extends Module {
    constructor() {
        super('MemberStats');
    }

    async init(client: Discord.Client): Promise<void> {
        client.on('message', (msg: Discord.Message) => {
            this.processMessage(msg);
        });
    }

    async getMemberStatsEmbed(m: Discord.GuildMember): Promise<Discord.MessageEmbed> {
        const stats = await this.getMemberStats(m);
        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed();
        const avatarURL = m.user.avatarURL();

        embed.setColor(m.displayHexColor);
        if(avatarURL) embed.setThumbnail(avatarURL);

        embed.setAuthor(`Stats for ${m.displayName}`);
        fields.push({
            name: `Messages sent`,
            value: stats.messages_sent.toString(),
            inline: true
        }, {
            name: `Songs queued`,
            value: stats.songs_queued.toString(),
            inline: true
        });
        embed.setFooter(`Member since: ${m.joinedAt?.toLocaleString()}`);

        embed.addFields(fields);
        return embed;
    }

    // Increments given stat by one
    async incrementMessagesSent(m: Discord.GuildMember): Promise<void> {
        const stats = await this.getMemberStats(m);

        stats.messages_sent += 1;
        await stats.save();
    }

    async incrementSongsQueued(m: Discord.GuildMember): Promise<void> {
        const stats = await this.getMemberStats(m);

        stats.songs_queued += 1;
        await stats.save();
    }

    async getMemberStats(m: Discord.GuildMember): Promise<MemberStatsDB> {
        const member = await getMember(m);
        let stats = await MemberStatsDB.findOne({
            where: {
                member: member
            }
        });

        if(!stats) {
            stats = MemberStatsDB.create();
            stats.member = member;
            await stats.save();
            log.debug(`Created MemberStats: ${m.displayName}`);
        }

        return stats;
    }

    async processMessage(msg: Discord.Message) {
        if(!msg.member)
            return;

        // Do not count messages that are commands
        const prefix = await getGuildPrefix(msg.member.guild);

        // Lazy check hehe
        if(msg.content.startsWith(prefix))
            return;

        await this.incrementMessagesSent(msg.member);
    }
}

export default new MemberStats();