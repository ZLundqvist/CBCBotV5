import Discord from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Guild } from "./guild";

@Entity()
export class Administrator extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Guild, guild => guild.administrators)
    guild!: Guild;

    @Column('text')
    userId!: string;    

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}


export async function isAdminInGuild(user: Discord.User, guild: Discord.Guild): Promise<boolean> {
    const admin = await Administrator.findOne({
        where: {
            userId: user.id,
            guildId: guild.id
        }
    });

    return admin != null;
}
