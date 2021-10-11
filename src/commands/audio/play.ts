import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { CommandInteraction } from 'discord.js';
import { GuildCommand } from "../../core";
import audio from '../../modules/audio';
import getLogger from '../../utils/logger';
import { connectIfAloneOrDisconnected, inSameChannelAs } from "../../utils/voice";

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play audio')
    .addStringOption((option) => {
        option
            .setName('audio')
            .setDescription('Link to video or search text')
            .setRequired(true);
        return option;
    });


class PlayCommand extends GuildCommand {
    constructor() {
        super(command, false, true);
    }

    async executeGuildCommand(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        if(member.voice.channel) {
            await connectIfAloneOrDisconnected(member.voice.channel);
        }

        if(!inSameChannelAs(member)) {
            await interaction.editReply('We must be in the same channel');
            return;
        }

        const query = interaction.options.getString('audio', true);

        const guildAudio = audio.getGuildAudio(guild);
        const queuedItem = await guildAudio.queue(member, query, true, true);

        if(queuedItem.embed) {
            const reply = await interaction.editReply({ embeds: [queuedItem.embed] });

            if(reply instanceof Discord.Message) {
                queuedItem.setEmbedMessage(reply);
                await guildAudio.attachSkipReaction(queuedItem);
            } else {
                log.warn('Not instance of Discord.Message. Cannot attach skip reaction.');
            }
        } else {
            await interaction.editReply(`Queued ${queuedItem.title}`);
        }
    }
}

export default new PlayCommand();
