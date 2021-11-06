import Discord from 'discord.js';
import { BotCore, Module } from '../../core';

class MemberStatsModule extends Module {
    constructor() {
        super('MemberStats');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        client.on('messageCreate', (msg: Discord.Message) => {
            this.onMessageCreate(msg);
        });
    }

    async destroy(): Promise<void> { }

    async getMemberStatsEmbed(m: Discord.GuildMember): Promise<Discord.MessageEmbed> {
        const member = await BotCore.database.getMember(m);
        const embed = new Discord.MessageEmbed();
        const avatarURL = m.user.avatarURL();

        embed.setColor(m.displayHexColor);
        if(avatarURL) embed.setThumbnail(avatarURL);

        embed.setAuthor(`Stats for ${m.displayName}`);

        embed.addFields({
            name: 'Messages sent',
            value: member.messages_sent.toString(),
            inline: true
        }, {
            name: 'Songs queued',
            value: member.songs_queued.toString(),
            inline: true
        });
        embed.setFooter(`Joined at: ${m.joinedAt?.toLocaleString()}`);

        return embed;
    }

    // Increments given stat by one
    async incrementMessagesSent(m: Discord.GuildMember): Promise<void> {
        const member = await BotCore.database.getMember(m);

        member.messages_sent += 1;
        await member.save();
    }

    async incrementSongsQueued(m: Discord.GuildMember): Promise<void> {
        const member = await BotCore.database.getMember(m);

        member.songs_queued += 1;
        await member.save();
    }

    async onMessageCreate(msg: Discord.Message) {
        if(!msg.member)
            return;

        await this.incrementMessagesSent(msg.member);
    }
}

export default new MemberStatsModule();
