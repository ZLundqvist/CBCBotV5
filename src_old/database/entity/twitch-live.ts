import Discord from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Administrator } from "./administrator";
import { Alias } from "./alias";
import { Blacklist } from "./blacklist";
import { Member } from "./member";
import { Guild } from './guild';

/**
 * Keep track of guilds that should be notified when a twitch user goes live
 */
@Entity()
@Unique(['guild', 'twitch_username'])
export class TwitchLive extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @ManyToOne(type => Guild, guild => guild.members)
    guild!: Guild;

    @Column('text')
    twitch_username!: string;

    @Column('text', { nullable: true })
    sfx!: string;
}

