import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Alias } from "./alias";
import { Member } from "./member";
import { QueueHistory } from './queue-history';

@Entity()
export class Guild extends BaseEntity {
    @PrimaryColumn('text')
    id!: string;

    @Column('int', { default: 1 })
    gpm!: number;

    @Column('int', { default: 100 })
    volume!: number;

    @Column('text', { nullable: true, default: 'hiagain' })
    entrysound!: string | null;

    @Column('text', { nullable: true, default: 'pc' })
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
