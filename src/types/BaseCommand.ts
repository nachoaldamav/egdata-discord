import {
    SlashCommandBuilder,
    type CommandInteraction,
    type AutocompleteInteraction,
    type SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import { consola } from 'consola';

export abstract class BaseCommand {
    abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

    protected logger = consola.withTag(this.constructor.name);

    abstract execute(interaction: CommandInteraction): Promise<void>;

    // Make autocomplete optional
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
} 