import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { SingleOffer } from '../types/offers.js';
import { client } from '../utils/client.js';

interface Giveaway {
  _id: string;
  id: string;
  namespace: string;
  startDate: string;
  endDate: string;
  historical: Omit<Giveaway, 'historical'>[];
}

interface FreeGame extends SingleOffer {
  giveaway: Giveaway;
}

const getFreebies = async () => {
  const data = await client
    .get<FreeGame[]>('/free-games')
    .then((res) => res.data);

  return data;
};

export default {
  data: new SlashCommandBuilder()
    .setName('freebies')
    .setDescription('Retrieves the current giveaways on Epic Games Store.'),
  async execute(interaction: CommandInteraction) {
    const data = await getFreebies();

    const embed = new EmbedBuilder()
      .setTitle('Current Giveaways')
      .setDescription(
        'Here are the current giveaways on Epic Games Store. Use the link below each giveaway to view more details on egdata.app.'
      )
      .setURL('https://egdata.app')
      .setColor(0x00ff00)
      .setTimestamp()
      .setFooter({ text: 'Powered by egdata.app' });

    for (const freebie of data) {
      const isEnded = new Date(freebie.giveaway.endDate) < new Date();
      const isOnGoing =
        new Date(freebie.giveaway.startDate) < new Date() &&
        new Date(freebie.giveaway.endDate) > new Date();
      const isUpcoming = new Date(freebie.giveaway.startDate) > new Date();

      if (isEnded) {
        continue;
      }

      embed.addFields([
        {
          name: freebie.title,
          value: `[View on egdata.app](https://egdata.app/offers/${freebie.id})`,
          inline: true,
        },
        {
          name: 'Status',
          value: isOnGoing ? 'On Going' : isUpcoming ? 'Upcoming' : 'Ended',
          inline: true,
        },
        {
          name: isOnGoing ? 'Ends' : 'Starts',
          value: `<t:${Math.floor(
            new Date(
              isOnGoing ? freebie.giveaway.endDate : freebie.giveaway.startDate
            ).getTime() / 1000
          )}:R>`,
          inline: true,
        },
      ]);
    }

    return interaction.reply({
      embeds: [embed],
    });
  },
};
