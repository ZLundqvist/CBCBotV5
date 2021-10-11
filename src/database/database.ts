import Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import * as typeorm from 'typeorm';
import getLogger from '../utils/logger';
import { Alias } from './entity/alias';
import { Guild } from './entity/guild';
import { Member } from './entity/member';
import { QueueHistory } from './entity/queue-history';

const log = getLogger(__dirname);

export class Database {
    private readonly fileName: string;
    private connection?: typeorm.Connection;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.setup();
    }

    private setup() {
        // Create dir
        const PATH = path.resolve('./', 'database/');
        if(!fs.existsSync(PATH)) {
            fs.mkdirSync(PATH);
            log.info(`Creating ${PATH}`);
        }
    }

    async createConnection(): Promise<void> {
        if(this.connection) {
            throw new Error('Connection already exists');
        }

        this.connection = await typeorm.createConnection({
            type: 'sqlite',
            database: `./database/${this.fileName}.sqlite`,
            entities: [
                Alias,
                Guild,
                Member,
                QueueHistory
            ],
            synchronize: true
        });

        log.info('Established connection to database: ' + this.connection.options.database);
    }

    async closeConnection(): Promise<void> {
        if(this.connection) {
            await this.connection.close();
            this.connection = undefined;
            log.info('Connection closed');
        } else {
            throw new Error('No connection exists');
        }
    }

    // UTILITY

    /**
     * Adds guilds which bot is part of to DB if it isn't already in the db
     * @param client 
     */
    async addMissingGuilds(guilds: Discord.Guild[]): Promise<void> {
        for(let guild of guilds) {
            await this.getGuild(guild);
        }
    }

    async getGuild(guild: Discord.Guild): Promise<Guild> {
        let dbGuild = await Guild.findOne(guild.id);

        if(!dbGuild) {
            dbGuild = new Guild();
            dbGuild.id = guild.id;
            await dbGuild.save();
            log.info(`Added guild ${guild.name} to database.`);
        }

        return dbGuild;
    }

    /**
     * Gets or creates a member in the database
     * @param m 
     * @returns 
     */
    async getMember(m: Discord.GuildMember): Promise<Member> {
        let member = await Member.findOne(m.id);

        if(!member) {
            const guild = await this.getGuild(m.guild);

            member = Member.create();
            member.id = m.id;
            member.guild = guild;
            await member.save();
        }

        return member;
    }

    async addMemberCurrency(m: Discord.GuildMember, amount: number): Promise<void> {
        const member = await this.getMember(m);
        member.currency += amount;
        await member.save();
    }

    /**
     * Withdraws the given amount from the members account. Returns the member's remaining currency
     * @param m 
     * @param amount 
     */
    async withdrawMemberCurrency(m: Discord.GuildMember, amount: number): Promise<number> {
        const member = await this.getMember(m);
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

    async canWithdrawAmount(m: Discord.GuildMember, amount: number): Promise<boolean> {
        const member = await this.getMember(m);
        return member.currency >= amount;
    }

    async getMemberCurrencyTop(guild: Discord.Guild, take: number): Promise<Member[]> {
        const dbGuild = await this.getGuild(guild);

        const members = await Member.find({
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

    async addGuildQueueItemToQueueHistory(guild: Discord.Guild, title: string, queuedByUserId: string): Promise<QueueHistory> {
        const dbGuild = await this.getGuild(guild);

        const entry = QueueHistory.create();
        entry.queuedByUserId = queuedByUserId;
        entry.title = title;
        entry.guild = dbGuild;
        await entry.save();

        return entry;
    }

    /**
     * Builds and returns an alias. DOES NOT SAVE TO DB!
     * @param guild 
     * @param key 
     * @param value 
     * @returns 
     */
    async buildAlias(guild: Discord.Guild, key: string, value: string): Promise<Alias> {
        const guildDB = await this.getGuild(guild);
        const alias = new Alias();
        alias.key = key;
        alias.guild = guildDB;
        alias.value = value;
        return alias;
    }

    async getAlias(guild: Discord.Guild, key: string): Promise<Alias | undefined> {
        return await Alias.findOne({
            where: {
                guild: guild.id,
                key: key
            }
        });
    }

    async getGuildAliases(guild: Discord.Guild): Promise<Alias[]> {
        return await Alias.find({
            where: {
                guild: guild.id
            }
        });
    }
}
