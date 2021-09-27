import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import config from '@utils/config';
import { BaseCommand } from 'core/base-command';
import { Routes } from 'discord-api-types/v9';
import Discord, { Collection } from 'discord.js';
import getLogger from './logger';


export function serializeCommands(commands: Collection<string, BaseCommand>) {
    return Array.from(commands.mapValues(command => command.toApplicationCommandData()).values());
}
