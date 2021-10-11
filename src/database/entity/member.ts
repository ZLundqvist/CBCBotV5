import { BaseEntity, Check, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Guild } from "./guild";

@Entity()
@Check(`"amount" >= 0`)
export class Member extends BaseEntity {
    @PrimaryColumn('text')
    id!: string;

    @ManyToOne(type => Guild, guild => guild.members)
    guild!: Guild;

    @Column('text', { nullable: true })
    entrysound!: string | null;

    @Column('int', { default: 1000 })
    currency!: number;

    @Column('int', { default: 0 })
    songs_queued!: number;

    @Column('int', { default: 0 })
    messages_sent!: number;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}
