import Discord from 'discord.js';
import moment from 'moment';
import { Colors, Images } from '../../constants';
import { BotCore, Module } from "../../core";

class CurrencyModule extends Module {
    distributer?: NodeJS.Timer;

    constructor() {
        super('currency');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        this.distributer = setInterval(() => {
            this.distributeGold(client);
        }, 60 * 1000);
        this.log.debug('Distributer enabled.');
    }

    async destroy(): Promise<void> {
        if(this.distributer) {
            clearInterval(this.distributer);
        }
    }

    async getMemberEmbed(member: Discord.GuildMember): Promise<Discord.MessageEmbed> {
        const currency = await BotCore.database.getMember(member);

        return new Discord.MessageEmbed()
            .setAuthor({
                name: member.displayName,
                iconURL: Images.currencyLogo
            })
            .setColor(Colors.gold)
            .addFields([
                {
                    name: 'Amount', // Repeat for formatting purposes
                    value: currency.currency + ' gold',
                    inline: true
                }
            ])
            .setFooter({
                text: `Tracked since: ${moment(currency.createdDate).fromNow()}`
            });
    }

    async getTopEmbed(guild: Discord.Guild, spots: number = 10): Promise<Discord.MessageEmbed> {
        const top = await BotCore.database.getMemberCurrencyTop(guild, spots);

        const embed = new Discord.MessageEmbed()
            .setAuthor({
                name: `Currency Leaderboard`,
                iconURL: Images.currencyLogo
            })
            .setColor(Colors.gold);

        top.forEach((currency, index) => {
            const member = guild.members.resolve(currency.id);

            if(member) {
                embed.addField(`#${index + 1} **${member.displayName}**`, `${currency.currency} gold`);
            }
        });

        return embed;
    }

    async getGPM(guild: Discord.Guild): Promise<number> {
        const guildDB = await BotCore.database.getGuild(guild);
        return guildDB.gpm;
    }

    async setGPM(guild: Discord.Guild, newValue: number): Promise<void> {
        const guildDB = await BotCore.database.getGuild(guild);
        guildDB.gpm = newValue;
        await guildDB.save();
    }

    private async distributeGold(client: Discord.Client<true>): Promise<void> {
        let distributedAmount = 0;
        let receivingMemberCount = 0;

        const guilds = client.guilds.cache.values();
        for(const guild of guilds) {
            try {
                const guildSettings = await BotCore.database.getGuild(guild);

                const voiceChannels = guild.channels.cache
                    .filter((channel): channel is Discord.VoiceChannel => channel.type === 'GUILD_VOICE') // Remove non-VoiceChannels
                    .filter((channel) => channel.id !== guild.afkChannelId); // Remove AFK channel

                const connectedMembers = voiceChannels
                    .flatMap(vc => vc.members)
                    .filter(member => !member.user.bot); // Do not distribute gold to bots

                for(const member of connectedMembers.values()) {
                    await BotCore.database.addMemberCurrency(member, guildSettings.gpm);
                    distributedAmount += guildSettings.gpm;
                    receivingMemberCount += 1;
                }
            } catch(error) {
                if(error instanceof Error) {
                    this.log.error(`Unable to distribute in guild ${guild.name}: ` + error.message);
                } else {
                    this.log.error(error);
                }
            }
        }

        this.log.trace(`Currency distributed (${distributedAmount} gold distributed to ${receivingMemberCount} members)`);
    }
}

export default new CurrencyModule();
