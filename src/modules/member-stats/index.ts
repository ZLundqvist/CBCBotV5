import { Module } from '@core';
import { DBMemberUtils } from '@db/member';
import getLogger from '@utils/logger';
import Discord from 'discord.js';

const log = getLogger(__dirname);

class MemberStatsModule extends Module {
    constructor() {
        super('MemberStats');
    }

    async init(client: Discord.Client): Promise<void> {
        client.on('messageCreate', (msg: Discord.Message) => {
            this.processMessage(msg);
        });
    }

    async getMemberStatsEmbed(m: Discord.GuildMember): Promise<Discord.MessageEmbed> {
        const member = await DBMemberUtils.getMember(m);
        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed();
        const avatarURL = m.user.avatarURL();

        embed.setColor(m.displayHexColor);
        if(avatarURL) embed.setThumbnail(avatarURL);

        embed.setAuthor(`Stats for ${m.displayName}`);
        fields.push({
            name: 'Messages sent',
            value: member.messages_sent.toString(),
            inline: true
        }, {
            name: 'Songs queued',
            value: member.songs_queued.toString(),
            inline: true
        });
        embed.setFooter(`Joined at: ${m.joinedAt?.toLocaleString()}`);

        embed.addFields(fields);
        return embed;
    }

    // Increments given stat by one
    async incrementMessagesSent(m: Discord.GuildMember): Promise<void> {
        const member = await DBMemberUtils.getMember(m);

        member.messages_sent += 1;
        await member.save();
    }

    async incrementSongsQueued(m: Discord.GuildMember): Promise<void> {
        const member = await DBMemberUtils.getMember(m);

        member.songs_queued += 1;
        await member.save();
    }

    async processMessage(msg: Discord.Message) {
        if(!msg.member)
            return;

        await this.incrementMessagesSent(msg.member);
    }
}

export default new MemberStatsModule();