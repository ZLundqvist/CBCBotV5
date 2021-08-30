import Discord from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Administrator } from "./administrator";
import { Alias } from "./alias";
import { Blacklist } from "./blacklist";
import { Member } from "./member";

@Entity()
export class Guild extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column('text')
    prefix!: string;

    @Column('int', { default: 1})
    gpm!: number;

    @Column('int', { default: 20 })
    volume!: number;

    @Column('text', { nullable: true })
    entrysound!: string | null;

    @Column('text', { nullable: true })
    pcsound!: string | null;

    @OneToMany(type => Administrator, administrator => administrator.guild)
    administrators!: Administrator[];

    @OneToMany(type => Member, member => member.guild)
    members!: Member[];

    @OneToMany(type => Blacklist, blacklisted => blacklisted.guild)
    blacklist!: Blacklist[];

    @OneToMany(type => Alias, alias => alias.guild)
    aliases!: Alias[];

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}

export async function getGuildPrefix(guild: Discord.Guild): Promise<string> {
    const guildData = await Guild.findOneOrFail(guild.id);

    return guildData.prefix;
}

export async function setGuildPrefix(guild: Discord.Guild, newPrefix: string): Promise<void> {
    const guildData = await Guild.findOneOrFail(newPrefix);
    guildData.prefix = newPrefix;
    await guildData.save();
}