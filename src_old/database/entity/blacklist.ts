import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Guild } from "./guild";

@Entity()
export class Blacklist extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Guild, guild => guild.blacklist)
    guild!: Guild;

    @Column('text')
    userId!: string;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}
