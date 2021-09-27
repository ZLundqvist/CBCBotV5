import Discord from 'discord.js';
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

/**
 * Gets or creates a member in the database
 * @param m 
 * @returns 
 */
async function getMember(m: Discord.GuildMember): Promise<Member> {
    let member = await Member.findOne(m.id);

    if(!member) {
        let guild = await Guild.findOneOrFail(m.guild.id);

        member = Member.create();
        member.id = m.id;
        member.guild = guild;
        await member.save();
    }

    return member;
}

async function addMemberCurrency(m: Discord.GuildMember, amount: number): Promise<void> {
    let member = await getMember(m);
    member.currency += amount;
    await member.save();
}

/**
 * Withdraws the given amount from the members account. Returns the member's remaining currency
 * @param m 
 * @param amount 
 */
async function withdrawMemberCurrency(m: Discord.GuildMember, amount: number): Promise<number> {
    let member = await getMember(m);
    try {
        member.currency -= amount;
        await member.save();

        return member.currency;
    } catch(error) {
        if(error instanceof Error && error.message.includes('CHECK constraint failed')) {
            throw new Error('Currency below 0');
        } else {
            throw error;
        }
    }
}

async function canWithdrawAmount(m: Discord.GuildMember, amount: number): Promise<boolean> {
    let member = await getMember(m);

    return member.currency >= amount;
}

async function getMemberCurrencyTop(guild: Discord.Guild, take: number): Promise<Member[]> {
    let dbGuild = await Guild.findOneOrFail(guild.id);

    let members = await Member.find({
        where: {
            guild: dbGuild
        },
        order: {
            currency: 'DESC'
        },
        take: take
    });

    return members;
}

export const DBMemberUtils = {
    getMember,
    addMemberCurrency,
    withdrawMemberCurrency,
    canWithdrawAmount,
    getMemberCurrencyTop
};
