import getLogger from '@utils/logger';
import Discord from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Alias } from "./alias";
import { Member } from "./member";
import { QueueHistory } from './queue-history';

const log = getLogger('database');

@Entity()
export class Guild extends BaseEntity {
    @PrimaryColumn('text')
    id!: string;

    @Column('int', { default: 1 })
    gpm!: number;

    @Column('int', { default: 20 })
    volume!: number;

    @Column('text', { nullable: true })
    entrysound!: string | null;

    @Column('text', { nullable: true })
    pcsound!: string | null;

    @OneToMany(type => Member, member => member.guild)
    members!: Member[];

    @OneToMany(type => Alias, alias => alias.guild)
    aliases!: Alias[];

    @OneToMany(type => QueueHistory, queueHistory => queueHistory.guild)
    queueHistory!: QueueHistory[];

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}

/**
 * Adds guilds which bot is part of to DB if it isn't already in the db
 * @param client 
 */
async function addMissingGuilds(guilds: Discord.Guild[]): Promise<void> {
    for(let guild of guilds) {
        await getGuild(guild);
    }
}

async function getGuild(guild: Discord.Guild): Promise<Guild> {
    let dbGuild = await Guild.findOne(guild.id);

    if(!dbGuild) {
        dbGuild = new Guild();
        dbGuild.id = guild.id;
        await dbGuild.save();
        log.info(`Added guild ${guild.name} to database.`);
    }

    return dbGuild;
}

export const DBGuildUtils = {
    addMissingGuilds,
    getGuild
};
