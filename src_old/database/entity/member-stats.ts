import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member";

@Entity()
export class MemberStats extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(type => Member, member => member.stats)
    @JoinColumn()
    member!: Member;

    @Column('int', { default: 0 })
    songs_queued!: number;

    @Column('int', { default: 0 })
    messages_sent!: number;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}