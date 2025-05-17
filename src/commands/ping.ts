import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import { BaseCommand } from '../types/BaseCommand.js';

export class PingCommand extends BaseCommand {
  override data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

  override async execute(interaction: CommandInteraction): Promise<void> {
    this.logger.info('Ping command received');
    await interaction.reply('Pong!');
  }
}

export default new PingCommand();
