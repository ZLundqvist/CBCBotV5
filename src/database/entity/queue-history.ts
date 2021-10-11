import Discord from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GuildQueueItem } from '../../modules/audio/guild-queue-item';
import { Guild } from "./guild";

@Entity()
export class QueueHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Guild, guild => guild.queueHistory)
    guild!: Guild;

    @Column('text')
    queuedByUserId!: string;

    @Column('text')
    title!: string;

    @CreateDateColumn()
    createdDate!: Date;
}

async function addGuildQueueItemToQueueHistory(guild: Discord.Guild, item: GuildQueueItem): Promise<QueueHistory> {
    let dbGuild = await Guild.findOneOrFail(guild.id);

    const entry = QueueHistory.create();
    entry.queuedByUserId = item.queuedByUserId;
    entry.title = item.title;
    entry.guild = dbGuild;
    await entry.save();

    return entry;
}

export const DBQueueHistoryUtils = {
    addGuildQueueItemToQueueHistory
};
