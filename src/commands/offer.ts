import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { SingleOffer } from '../types/offers.js';
import { getImage } from '../utils/get-image.js';
import { client } from '../utils/client.js';
import { offersDictionary } from '../utils/offer-types.js';
import { type Genre, genres } from '../utils/genres.js';

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

const getOfferMedia = async (offer: SingleOffer) => {
  return client
    .get<{
      images: {
        _id: string;
        src: string;
      }[];
      videos: {
        _id: string;
        outputs: {
          duration: number;
          url: string;
          width: number;
          height: number;
          key: string;
          contentType: string;
          _id: string;
        }[];
      }[];
    }>(`/offers/${offer.id}/media`)
    .then((res) => res.data)
    .catch(() => null);
};

const getPrice = async (id: string, country: string) => {
  return client
    .get<{
      _id: string;
      country: string;
      namespace: string;
      offerId: string;
      __v: number;
      appliedRules: Array<unknown>;
      price: {
        currencyCode: string;
        discount: number;
        discountPrice: number;
        originalPrice: number;
        basePayoutCurrencyCode: string;
        basePayoutPrice: number;
        payoutCurrencyExchangeRate: number;
        _id: string;
      };
      region: string;
      updatedAt: string;
    }>(`/offers/${id}/price`, {
      params: {
        country,
      },
    })
    .then((res) => res.data)
    .catch(() => null);
};

export default {
  data: new SlashCommandBuilder()
    .setName('offer')
    .setDescription('Retrieves the latest offer from the EGData API.')
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

    const [offerMediaRaw, allGenresRaw, priceUS, priceEUR] =
      await Promise.allSettled([
        getOfferMedia(data),
        genres(),
        getPrice(data.id, 'US'),
        getPrice(data.id, 'ES'),
      ]);

    const offerMedia =
      offerMediaRaw.status === 'fulfilled' ? offerMediaRaw.value : null;
    const allGenres =
      allGenresRaw.status === 'fulfilled' ? allGenresRaw.value : [];
    const usPrice = priceUS.status === 'fulfilled' ? priceUS.value : null;
    const eurPrice = priceEUR.status === 'fulfilled' ? priceEUR.value : null;

    const eurFmtr = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    });
    const usFmtr = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    const offerGenres = data.tags
      .map((tag) => allGenres.find((genre) => genre.id === tag.id))
      .filter((genre) => genre);

    const embed = new EmbedBuilder()
      .setTitle(data.title)
      .setDescription(data.description)
      .setURL(
        `https://egdata.app/offers/${data.id}?utm_source=discord&utm_medium=bot&utm_campaign=offer`
      )
      .setThumbnail(
        getImage(data.keyImages, [
          'CodeRedemption_340x440',
          'DieselGameBoxTall',
          'DieselStoreFrontTall',
          'OfferImageTall',
        ])?.url.replaceAll(' ', '%20') ?? 'https://egdata.app/placeholder.webp'
      )
      .addFields([
        {
          name: 'Genres',
          value:
            offerGenres.length > 0
              ? offerGenres
                  .map((genre: Genre | undefined) => {
                    if (genre) {
                      return `[${genre.name}](https://egdata.app/search?tags=${genre.id})`;
                    }
                    return '';
                  })
                  .join(', ')
              : 'No genres',
          inline: true,
        },
        {
          name: 'Type',
          value: offersDictionary[data.offerType] ?? data.offerType,
          inline: true,
        },
        {
          name: 'Developer',
          value: data.developerDisplayName ?? data.seller.name,
          inline: true,
        },
        {
          name: 'Last Modified',
          value: `<t:${Math.floor(
            new Date(data.lastModifiedDate).getTime() / 1000
          )}:R>`,
          inline: true,
        },
        {
          name: 'Price',
          value: `${
            usPrice ? `${usFmtr.format(usPrice.price.discountPrice / 100)}` : ''
          } / ${
            eurPrice
              ? `${eurFmtr.format(eurPrice.price.discountPrice / 100)}`
              : ''
          }`,
          inline: true,
        },
      ])
      .setColor(0x00ff00)
      .setAuthor({
        name: data.seller.name,
      })
      .setFooter({
        text: 'Check more offers on egdata.app',
        iconURL: 'https://egdata.app/logo_simple_white.png',
      })
      .setTimestamp(new Date(data.releaseDate ?? data.effectiveDate));

    const images = (offerMedia?.images ?? []).map((image) =>
      new EmbedBuilder()
        .setURL(
          `https://egdata.app/offers/${data.id}?utm_source=discord&utm_medium=bot&utm_campaign=offer`
        )
        .setImage(image.src)
    );

    if (images.length > 3) {
      images.unshift(
        new EmbedBuilder()
          .setURL(
            `https://egdata.app/offers/${data.id}?utm_source=discord&utm_medium=bot&utm_campaign=offer`
          )
          .setImage(
            getImage(data.keyImages, [
              'CodeRedemption_340x440',
              'DieselGameBoxTall',
              'DieselStoreFrontTall',
              'OfferImageTall',
            ])?.url ?? 'https://egdata.app/placeholder.webp'
          )
      );
    }

    return interaction.reply({
      embeds: [embed, ...images.slice(0, 3)],
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
        name: `${result.title} (${
          offersDictionary[result.offerType] ?? result.offerType
        })`,
        value: result.id,
      }))
    );
  },
};
