import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Guild } from "./guild";

@Entity()
export class Alias extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Guild, guild => guild.aliases)
    guild!: Guild;

    @Column('text', { unique: true })
    key!: string;

    @Column('text')
    value!: string;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn()
    updatedDate!: Date;
}
