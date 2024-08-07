import { config } from 'dotenv';
config();

export const token = process.env['DISCORD_TOKEN'] as string;
export const clientId = process.env['DISCORD_CLIENT_ID'] as string;
export const guildId = process.env['DISCORD_GUILD_ID'] as string;
