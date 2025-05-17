import { config } from 'dotenv';

config();

export const token = process.env['DISCORD_TOKEN'] || '';
export const clientId = process.env['DISCORD_CLIENT_ID'] as string;
export const guildId = process.env['DISCORD_GUILD_ID'] as string;
export const healthCheckPort = parseInt(process.env['HEALTH_CHECK_PORT'] || '3000', 10);
