export interface SingleItem {
  _id: string;
  id: string;
  namespace: string;
  title: string;
  description: string;
  keyImages: KeyImage[];
  categories: Category[];
  status: string;
  creationDate: string;
  lastModifiedDate: string;
  customAttributes: CustomAttribute[];
  entitlementName: string;
  entitlementType: string;
  itemType: string;
  releaseInfo: ReleaseInfo[];
  developer: string;
  developerId: string;
  eulaIds: string[];
  installModes: unknown[];
  endOfSupport: boolean;
  unsearchable: boolean;
  requiresSecureAccount?: boolean;
  linkedOffers: string[];
  applicationId?: string;
  longDescription?: string;
  __v: number;
}

export interface KeyImage {
  type: string;
  url: string;
  md5: string;
}

export interface Category {
  path: string;
  _id: string;
}

export interface CustomAttribute {
  key: string;
  type: string;
  value: string;
}

export interface ReleaseInfo {
  id: string;
  appId: string;
  platform: string[];
  _id: string;
}
