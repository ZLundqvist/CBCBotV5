import 'reflect-metadata';
import * as core from '@core';
import getLogger from './utils/logger';
import { getNodeEnv, getEnv } from '@utils/environment';

const log = getLogger('core');

log.info('Starting CBCBotV5');
log.info(`Version: ${getEnv('npm_package_version') || getEnv('version')}`);
log.info(`Running in ${getNodeEnv()} mode`);

core.start();
