import { Command } from "../../core/command";
import Discord from 'discord.js';
import memberStats from "../../modules/member-stats";

const name = 'GetMemberStats';
const keywords = [ 'stats' ];
const description = '[@member]. Shows stats for message sender or mentioned member.';

class GetMemberStats extends Command {
    constructor() {
        super(name, keywords, description, true, false);
    }

    async execute(msg: Discord.Message): Promise<void> {
        if(!msg.member)
            return;

        const mentionedMember = msg.mentions.members?.first();

        if(mentionedMember) {
            await msg.channel.send(await memberStats.getMemberStatsEmbed(mentionedMember));
        } else {
            await msg.channel.send(await memberStats.getMemberStatsEmbed(msg.member));
        }
    }
}

export default new GetMemberStats();