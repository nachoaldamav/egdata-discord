import {
    SlashCommandBuilder,
    type CommandInteraction,
    EmbedBuilder,
    type Role,
    type GuildMember,
} from 'discord.js';
import { client } from '../utils/client.js';
import { AxiosError } from 'axios';

const allowedRolesIds = [
    "561599327680593950", // Admin
    "1106969216319488161", // Administrator
    "561599604337147920", // Mod
    "978369326904119386", // Whisperer
    "978294597409177630", // Community Pillar
    "978753984498131054", // Community Contributor
    "852575108664393789", // Server Booster
    "827977535471747163" // Epic Gamer
]

export default {
    data: new SlashCommandBuilder()
        .setName('regenerate')
        .setDescription('Regenerates offer data for a specific offer.')
        .addStringOption((option) =>
            option
                .setName('slug')
                .setDescription('The offer slug to regenerate.')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('id')
                .setDescription('The offer id to regenerate.')
                .setRequired(false)
        ),

    async execute(interaction: CommandInteraction) {
        if (!interaction.member || !('roles' in interaction.member)) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                ephemeral: true,
            });
        }

        const member = interaction.member as GuildMember;
        if (!member.roles.cache.some((role: Role) => allowedRolesIds.includes(role.id))) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true,
            });
        }

        const slug = interaction.options.get('slug')?.value?.toString();
        const id = interaction.options.get('id')?.value?.toString();

        console.log(`Slug: ${slug}`);
        console.log(`ID: ${id}`);

        if (!slug && !id) {
            return interaction.reply({
                content: 'Please provide a valid offer slug or id.',
                ephemeral: true,
            });
        }

        try {
            const target = id || slug;

            console.log(`Regenerating offer: ${target}`);

            const url = id
                ? `/offers/regen-by-id/${target}`
                : `/offers/regen/${target}`

            console.log(`Making request to: ${url}`);

            // Make request to your API to regenerate the offer
            const response = await client.put<{ message: string }>(url).catch((error) => {
                console.error('Request failed:', error);
                throw error;
            });

            console.log(`Response received:`, response.data);

            const embed = new EmbedBuilder()
                .setTitle('Offer Regeneration')
                .setDescription(response.data.message || `Successfully triggered regeneration for offer: ${target}`)
                .setColor(0x00ff00)
                .setTimestamp();

            return await interaction.reply({
                embeds: [embed],
            });
        } catch (error: unknown) {
            console.error('Error regenerating offer:', error);

            if (error instanceof AxiosError) {
                console.error('Axios Error Details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message,
                    code: error.code,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                    },
                });
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return await interaction.reply({
                content: `Failed to regenerate offer: ${errorMessage}`,
                ephemeral: true,
            });
        }
    },
}; 