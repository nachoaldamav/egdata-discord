import {
    SlashCommandBuilder,
    type CommandInteraction,
    type AutocompleteInteraction,
    type SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export abstract class BaseCommand {
    abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

    abstract execute(interaction: CommandInteraction): Promise<void>;

    // Optional autocomplete method - only implement if needed
    abstract autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
} 