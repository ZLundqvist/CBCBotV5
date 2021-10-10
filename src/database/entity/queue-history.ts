import { GuildQueueItem } from '@modules/audio/guild-queue-item';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Guild } from "./guild";
import Discord from 'discord.js';

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
