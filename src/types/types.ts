export enum CountryStatus {
  Published = 'Published',
  Draft = 'Draft',
  Archive = 'Archive',
}

export enum RegionStatus {
  Published = 'Published',
  Draft = 'Draft',
  Archive = 'Archive',
}
export enum StatusOption {
  Published = 'Published',
  Draft = 'Draft',
  Archive = 'Archive',
}

export type userWithRole = {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  avatar: string;
  role: string;
};
