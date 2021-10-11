import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
