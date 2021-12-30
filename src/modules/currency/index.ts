import Discord, { EmbedField } from 'discord.js';
import moment from 'moment';
import { Colors, Images } from '../../constants';
import { BotCore, Module } from "../../core";

class CurrencyModule extends Module {
    distributer?: NodeJS.Timeout;

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

        const embed = new Discord.MessageEmbed();
        embed.setAuthor(member.displayName, Images.currencyLogo);
        embed.setColor(Colors.gold);
        embed.addFields([
            {
                name: 'Amount' + widen(15), // Repeat for formatting purposes
                value: currency.currency + ' gold',
                inline: true
            }
        ]);
        embed.setFooter(`Tracked since: ${moment(currency.createdDate).fromNow()}`)

        return embed;
    }

    async getTopEmbed(guild: Discord.Guild, spots: number = 10): Promise<Discord.MessageEmbed> {
        const top = await BotCore.database.getMemberCurrencyTop(guild, spots);

        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed();
        embed.setAuthor('Gold Top ' + spots + widen(6), Images.currencyLogo);
        embed.setColor(Colors.gold);

        top.forEach((currency, index) => {
            const member = guild.members.resolve(currency.id);

            fields.push({
                name: `#${index + 1} **${member ? member.displayName : 'UNKNOWN_USER'}**`,
                value: `${currency.currency} gold`
            } as EmbedField);
        });

        embed.addFields(fields);
        return embed;
    }

    async getGPM(guild: Discord.Guild): Promise<number> {
        const guildDB = await BotCore.database.getGuild(guild);
        return guildDB.gpm;
    }

    async setGPM(guild: Discord.Guild, newValue: number) {
        const guildDB = await BotCore.database.getGuild(guild);
        guildDB.gpm = newValue;
        await guildDB.save();
    }

    async distributeGold(client: Discord.Client<true>) {
        for(const guild of client.guilds.cache.values()) {
            try {
                const guildSettings = await BotCore.database.getGuild(guild);

                const voiceChannels = Array.from(guild.channels.cache.values())
                    .filter((channel): channel is Discord.VoiceChannel => channel.isVoice() && channel.type === 'GUILD_VOICE') // Only take VoiceChannel
                    .filter(vc => vc.guild.afkChannelId !== vc.id);  // Remove AFK channels


                // Gathers all connected members and flattens that array
                const connectedMembers = voiceChannels.map(vc => Array.from(vc.members.values())).flat();

                for(const member of connectedMembers) {
                    await BotCore.database.addMemberCurrency(member, guildSettings.gpm);
                }
            } catch(error) {
                if(error instanceof Error) {
                    this.log.error(`Unable to distribute in guild ${guild.name}: ` + error.message);
                } else {
                    this.log.error(error);
                }

            }
        }
        this.log.trace('Currency distributed');
    }
}

/**
 * Adds x number of tabs and then a invisiable char to indent lines in embeds
 * @param n width
 */
function widen(n: number) {
    return '\t'.repeat(n) + '\u200C';
}

export default new CurrencyModule();
