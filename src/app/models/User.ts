export class User {
  _id: string;
  cid: string;
  name?: string;
  first_name: string;
  last_name: string;
  atc_rating: string;
  pilot_rating: number | [string] | string;
  email: string;
  group_name?: string;
  groups: {primary: Group, secondary: Group[]};
  country: string;
  region: string;
  division: string;
  discord: {id: string, username: string, discriminator: string, avatar: string, ban: {kind: string, reason: string, expires: Date}, allowed: boolean | null};
  perms: {perm: Perm, level: number}[];
  staff_notes: {_id: string, content: string, creator: User}[];
  username: string;
  banned: string;
}

export class Group {
  _id: string;
  name: string;
  colour: string;
  staff: boolean;
  inherit: string[];
  perms: {perm: Perm, level: number}[];
}

export class Perm {
  sku: string;
  name: string;
  description: string;
  level?: number;
}
