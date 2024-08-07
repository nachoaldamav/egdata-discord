import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { SingleOffer } from '../types/offers.js';
import { client } from '../utils/client.js';
import { offersDictionary } from '../utils/offer-types.js';

const search = async (query: string) => {
  const data = await client
    .get<{
      hits: SingleOffer[];
    }>('/multisearch/offers', {
      params: {
        query,
      },
    })
    .then((res) => res.data);

  return data;
};

const getOffer = async (id: string) => {
  const data = await client
    .get<SingleOffer>(`/offers/${id}`)
    .then((res) => res.data);

  return data;
};

export default {
  data: new SlashCommandBuilder()
    .setName('geolock')
    .setDescription(
      'Retrieves the restricted countries list for a given offer.'
    )
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The query to search for.')
        .setAutocomplete(true)
    ),

  async execute(interaction: CommandInteraction) {
    const id = interaction.options.get('query');

    if (!id) {
      return interaction.reply({
        content: 'Please provide an ID.',
        ephemeral: true,
      });
    }

    const data = await getOffer(id.value?.toString() || '').catch(() => null);

    if (!data) {
      return interaction.reply({
        content: 'No offer found with that ID.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(data.title)
      .setURL(
        `https://egdata.app/offers/${data.id}?utm_source=discord&utm_medium=bot&utm_campaign=offer`
      )
      .addFields([
        ...(data.countriesBlacklist
          ? [
              {
                name: 'Countries Blacklisted',
                value: (data.countriesBlacklist ?? []).join(', '),
              },
            ]
          : []),
        ...(data.countriesWhitelist
          ? [
              {
                name: 'Countries Whitelisted',
                value: (data.countriesWhitelist ?? []).join(', '),
              },
            ]
          : []),
      ])
      .setColor(0x00ff00)
      .setFooter({
        text: 'Check more offers on EGData.app',
        iconURL: 'https://cdn.discordapp.com/emojis/1226575784479686738.webp',
      })
      .setTimestamp(new Date(data.effectiveDate));

    return interaction.reply({
      embeds: [embed],
    });
  },

  async autocomplete(interaction: CommandInteraction) {
    const focusedValue = interaction.options.get('query');
    const query = focusedValue?.value || '';

    const data = await search(query.toString());

    if (!data) {
      // @ts-expect-error
      return interaction.respond([]);
    }

    const results = data.hits;

    // @ts-expect-error
    return interaction.respond(
      results.slice(0, 5).map((result: any) => ({
        name: `${result.title} (${
          offersDictionary[result.offerType] ?? result.offerType
        })`,
        value: result.id,
      }))
    );
  },
};
