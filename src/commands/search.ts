import { SlashCommandBuilder, type CommandInteraction } from 'discord.js';
import { client } from '../utils/client.js';
// import { dedent } from 'ts-dedent';

const search = async (query: string) => {
  const data = await client
    .get('/multisearch/offers', {
      params: {
        query,
      },
    })
    .then((res) => res.data);

  return data;
};

export default {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Searches in the egdata DB.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The query to search for.')
        .setAutocomplete(true)
    ),

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
      results.slice(0, 5).map((result: any) => ({
        name: result.title,
        value: result.id,
      }))
    );
  },
};
