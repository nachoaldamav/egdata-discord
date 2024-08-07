import type { Price } from './price.js';

export interface SingleOffer {
  _id: string;
  id: string;
  namespace: string;
  title: string;
  description: string;
  offerType: string;
  effectiveDate: string;
  creationDate: string;
  lastModifiedDate: string;
  isCodeRedemptionOnly: boolean;
  keyImages: KeyImage[];
  seller: Seller;
  productSlug: string | null;
  urlSlug: string | null;
  url: string | null;
  tags: Tag[];
  items: Item[];
  customAttributes: {
    [key: string]: {
      type: string;
      value: string;
    };
  };
  categories: string[];
  developerDisplayName: string | null;
  publisherDisplayName: string | null;
  prePurchase: boolean | null;
  releaseDate: string;
  pcReleaseDate: string | null;
  viewableDate: string;
  countriesBlacklist: string[] | null;
  countriesWhitelist: string[] | null;
  refundType: string;
  offerMappings: Array<{
    pageSlug: string;
    pageType: string;
  }> | null;
  price: Price | null;
}

export interface KeyImage {
  type: string;
  url: string;
  md5: string;
}

export interface Seller {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  namespace: string;
  _id: string;
}

export interface CustomAttribute {
  key: string;
  value: string;
}
