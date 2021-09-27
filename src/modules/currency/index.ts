import { Colors, Images } from '@constants';
import { Module } from "@core";
import { Guild } from "@db/guild";
import { DBMemberUtils } from '@db/member';
import getLogger from '@utils/logger';
import Discord, { EmbedField } from 'discord.js';
import moment from 'moment';

const log = getLogger(__dirname);

class CurrencyModule extends Module {
    distributer: NodeJS.Timeout | null = null;

    constructor() {
        super('Currency');
    }

    async init(client: Discord.Client<true>): Promise<void> {
        if(this.distributer) {
            clearInterval(this.distributer);
        }

        this.distributer = setInterval(() => {
            this.distributeGold(client);
        }, 60 * 1000);
        log.debug('Distributer enabled.');
    }

    async getMemberEmbed(member: Discord.GuildMember): Promise<Discord.MessageEmbed> {
        const currency = await DBMemberUtils.getMember(member);

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
        const top = await DBMemberUtils.getMemberCurrencyTop(guild, spots);

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

        for(let guild of client.guilds.cache.values()) {
            try {
                const guildSettings = await Guild.findOneOrFail(guild.id);

                let vcs: Discord.VoiceChannel[] = Array.from(guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').values()) as Discord.VoiceChannel[];

                // Remove AFK channels
                vcs = vcs.filter(vc => vc.guild.afkChannelId !== vc.id);

                // Gathers all connected members and flattens that array
                let connectedMembers = vcs.map(vc => Array.from(vc.members.values())).reduce((acc, cur) => acc.concat(cur), []);

                for(let member of connectedMembers) {
                    await DBMemberUtils.addMemberCurrency(member, guildSettings.gpm);
                }
            } catch(error) {
                if(error instanceof Error) {
                    log.error(`Unable to distribute in guild ${guild.name}: ` + error.message);
                } else {
                    log.error(error);
                }

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

export default new CurrencyModule();