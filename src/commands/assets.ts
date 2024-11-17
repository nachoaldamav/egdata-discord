import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { client } from '../utils/client.js';
import type { SingleItem } from '../types/items.js';
import { getImage } from '../utils/get-image.js';
import type { Asset } from '../types/asset.js';

const search = async (query: string) => {
  const data = await client
    .get<{
      hits: SingleItem[];
    }>('/multisearch/items', {
      params: {
        query,
        type: 'EXECUTABLE',
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

const getItemAssets = async (id: string) => {
  const data = await client
    .get<Asset[]>(`/items/${id}/assets`)
    .then((res) => res.data);
  return data;
};

export default {
  data: new SlashCommandBuilder()
    .setName('assets')
    .setDescription('Retrieves the assets for a specific game.')
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

    const [itemRaw, assetsRaw] = await Promise.allSettled([
      getItem(id.value?.toString() || ''),
      getItemAssets(id.value?.toString() || ''),
    ]);
    const item = itemRaw.status === 'fulfilled' ? itemRaw.value : null;
    const assets = assetsRaw.status === 'fulfilled' ? assetsRaw.value : null;

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
      .setTimestamp(new Date(item.lastModifiedDate))
      .addFields(
        (assets ?? []).map((asset) => ({
          name: asset.platform,
          value: `Download size: ${formatBytes(
            asset.downloadSizeBytes
          )}\nInstalled size: ${formatBytes(asset.installedSizeBytes)}`,
          inline: false,
        }))
      );

    return interaction.reply({
      embeds: [embed],
    });
  },

  async autocomplete(interaction: CommandInteraction) {
    const focusedValue = interaction.options.get('query');
    const query = focusedValue?.value || '';

    console.log('Autocomplete query:', query);

    const data = await search(query.toString());

    if (!data) {
      // @ts-expect-error
      return interaction.respond([]);
    }

    const results = data.hits;

    // @ts-expect-error
    return interaction.respond(
      results.slice(0, 5).map((result) => ({
        name: `${result.title}`,
        value: result.id,
      }))
    );
  },
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
