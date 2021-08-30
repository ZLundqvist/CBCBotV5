import Discord, { EmbedField, EmbedFieldData } from 'discord.js';
import moment from 'moment';
import colors from '../../constants/colors';
import images from '../../constants/images';
import { Module } from "../../core/module";
import { Guild } from "../../database/entity/guild";
import { addMemberCurrency, getMember, getMemberCurrencyTop } from '../../database/entity/member';
import getLogger from '../../utils/logger';

const log = getLogger(__dirname);

class Currency extends Module {
    distributer: NodeJS.Timeout | null = null;

    constructor() {
        super('Currency');
    }

    async init(client: Discord.Client): Promise<void> {
        client.on('readyWithClient' as any, (client: Discord.Client) => {
            if(this.distributer) {
                clearInterval(this.distributer);
            }

            this.distributer = setInterval(() => {
                this.distributeGold(client);
            }, 60 * 1000);
            log.debug('Distributer enabled.');
        });
    }

    async getMemberEmbed(member: Discord.GuildMember): Promise<Discord.MessageEmbed> {
        const currency = await getMember(member);

        const embed = new Discord.MessageEmbed();
        embed.setAuthor(member.displayName, images.currencyLogo);
        embed.setColor(colors.gold);
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
        const top = await getMemberCurrencyTop(guild, spots);

        const fields: Discord.EmbedField[] = [];
        const embed = new Discord.MessageEmbed();
        embed.setAuthor('Gold Top ' + spots + widen(6), images.currencyLogo);
        embed.setColor(colors.gold);

        top.forEach((currency, index) => {
            const member = guild.member(currency.id);

            fields.push({
                name: `#${index + 1} **${member ? member.displayName : 'UNKNOWN_USER'}**`,
                value: `${currency.currency} gold`
            } as EmbedField);
        });

        embed.addFields(fields);
        return embed;
    }

    async getGPM(guild: Discord.Guild): Promise<number> {
        const guildDB = await Guild.findOneOrFail(guild.id);
        return guildDB.gpm;
    }

    async setGPM(guild: Discord.Guild, newValue: number) {
        const guildDB = await Guild.findOneOrFail(guild.id);
        guildDB.gpm = newValue;
        await guildDB.save();
    }

    async distributeGold(client: Discord.Client) {
        if(!client.readyAt) {
            log.warn('Client not ready, cannot distribute.');
            return;
        }

        for(let guild of client.guilds.cache.array()) {
            try {
                const guildSettings = await Guild.findOneOrFail(guild.id);

                let vcs = <Discord.VoiceChannel[]> guild.channels.cache.filter(c => c.type === 'voice').array();

                // Remove AFK channels
                vcs = vcs.filter(vc => vc.guild.afkChannelID !== vc.id);

                // Gathers all connected members and flattens that array
                let connectedMembers = vcs.map(vc => vc.members.array()).reduce((acc, cur) => acc.concat(cur), []);

                for(let member of connectedMembers) {
                    await addMemberCurrency(member, guildSettings.gpm);
                }
            } catch(error) {
                log.error(`Unable to distribute in guild ${guild.name}: ` + error.message);
            }
        }
        log.trace('Currency distributed');
    }
}

/**
 * Adds x number of tabs and then a invisiable char to indent lines in embeds
 * @param n width
 */
function widen(n: number) {
    return '\t'.repeat(n) + '\u200C';
}

export default new Currency();