import { GuildCommand } from "@core";
import { SlashCommandBuilder } from '@discordjs/builders';
import audio from '@modules/audio';
import getLogger from '@utils/logger';
import { connectIfAloneOrDisconnected, inSameChannelAs, inVoiceChannel } from "@utils/voice";
import Discord, { CommandInteraction } from 'discord.js';

const log = getLogger(__dirname);

const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play audio')
    .addStringOption((option) => {
        option
            .setName('audio')
            .setDescription('Link to video or search string')
            .setRequired(true);
        return option;
    });


class PlayCommand extends GuildCommand {
    constructor() {
        super(command, false, true);
    }

    async execute(interaction: CommandInteraction, guild: Discord.Guild, member: Discord.GuildMember): Promise<void> {
        if(!inVoiceChannel(guild) && member.voice.channel) {
            await connectIfAloneOrDisconnected(member.voice.channel);
        }

        if(!inSameChannelAs(member)) {
            await interaction.editReply({
                content: 'We must be in the same channel'
            });
            return;
        }

        const guildAudio = audio.getGuildAudio(guild);

        const query = interaction.options.getString('audio', true);
        const item = await guildAudio.queue(member, query, true, true);


        if(item.embed) {
            const reply = await interaction.editReply({ embeds: [item.embed] });

            if(reply instanceof Discord.Message) {
                item.setEmbedMessage(reply);
                await guildAudio.attachSkipReaction(item);
            } else {
                log.warn('Not instance of Discord.Message. Cannot attach skip reaction.');
            }
        }
    }
}

export default new PlayCommand();
