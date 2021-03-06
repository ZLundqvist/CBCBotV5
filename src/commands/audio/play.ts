import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import { GuildCommand, RunGuildCommandContext } from "../../core";
import audio from '../../modules/audio';
import { connectIfAloneOrDisconnected, inSameChannelAs } from "../../utils/voice";

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

export default class PlayCommand extends GuildCommand {
    constructor() {
        super(command.toJSON(), {
            autoDefer: true
        });
    }

    async runGuildCommand({ interaction, guild, member }: RunGuildCommandContext): Promise<void> {
        if(member.voice.channel) {
            await connectIfAloneOrDisconnected(member.voice.channel);
        }

        if(!inSameChannelAs(member)) {
            await interaction.editReply('We must be in the same channel');
            return;
        }

        const query = interaction.options.getString('audio', true);

        const guildAudio = audio.getGuildAudio(guild);
        const queuedItem = await guildAudio.smartQueue(query, member, true);

        const embed = queuedItem.getMessageEmbed();
        const reply = await interaction.editReply({ embeds: [embed] });

        if(reply instanceof Discord.Message) {
            queuedItem.setEmbedMessage(reply);
            await guildAudio.attachSkipReaction(queuedItem);
        } else {
            this.log.warn('Not instance of Discord.Message. Cannot attach skip reaction.');
        }
    }
}
