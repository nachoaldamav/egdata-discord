import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { client } from '../utils/client.js';
import type { SingleItem } from '../types/items.js';
import { getImage } from '../utils/get-image.js';

const search = async (query: string, type?: string) => {
  const data = await client
    .get<{
      hits: SingleItem[];
    }>('/multisearch/items', {
      params: {
        query,
        type,
      },
    })
    .then((res) => res.data);

  return data;
};

const getItem = async (id: string) => {
  const data = await client
    .get<SingleItem>(`/items/${id}`)
    .then((res) => res.data);
  return data;
};

export default {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Retrieves the latest item from the EGData API.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The query to search for.')
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The type of item to search for.')
        .setChoices([
          { name: 'Game', value: 'EXECUTABLE' },
          { name: 'Audience', value: 'AUDIENCE' },
        ])
        .setRequired(false)
    ),

  async execute(interaction: CommandInteraction) {
    const id = interaction.options.get('query');

    if (!id) {
      return interaction.reply({
        content: 'Please provide an ID.',
        ephemeral: true,
      });
    }

    const [itemRaw] = await Promise.allSettled([
      getItem(id.value?.toString() || ''),
    ]);
    const item = itemRaw.status === 'fulfilled' ? itemRaw.value : null;

    if (!item) {
      return interaction.reply({
        content: 'No item found with that ID.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(item.title)
      .setURL(
        `https://egdata.app/items/${item.id}?utm_source=discord&utm_medium=bot&utm_campaign=item`
      )
      .setThumbnail(
        getImage(item.keyImages, [
          'DieselGameBoxTall',
          'DieselStoreFrontTall',
        ])?.url.replaceAll(' ', '%20') ?? 'https://egdata.app/placeholder.webp'
      )
      .setColor(0x00ff00)
      .setTimestamp(new Date(item.lastModifiedDate));

    return interaction.reply({
      embeds: [embed],
    });
  },

  async autocomplete(interaction: CommandInteraction) {
    const focusedValue = interaction.options.get('query');
    const type = interaction.options.get('type');
    const query = focusedValue?.value || '';

    console.log('Autocomplete query:', query);

    const data = await search(
      query.toString(),
      type?.value?.toString() ?? undefined
    );

    if (!data) {
      // @ts-expect-error
      return interaction.respond([]);
    }

    const results = data.hits;

    // @ts-expect-error
    return interaction.respond(
      results.slice(0, 5).map((result) => ({
        name: `${result.title} (${result.entitlementType})`,
        value: result.id,
      }))
    );
  },
};
