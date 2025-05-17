import type { SingleOffer } from './offers.js';

export interface SearchResponse {
    hits: SingleOffer[];
}

export interface OfferMediaResponse {
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
}

export interface PriceResponse {
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
}

export interface TopsResponse {
    [key: string]: number;
} 