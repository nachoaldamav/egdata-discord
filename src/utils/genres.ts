import { client } from './client.js';

const __cache = new Map();

export type Genre = {
  _id: string;
  id: string;
  name: string;
  status: string;
  groupName: string;
  aliases: string[];
  __v: number;
  comment: string;
  created: string;
  groupId: string;
  namespace?: string;
  referenceCount: number;
  updated: string;
};

export async function genres(): Promise<Genre[]> {
  if (__cache.has('genres')) {
    return __cache.get('genres');
  }

  const data = await client
    .get<Genre[]>('/tags', {
      params: {
        group: 'genre',
      },
    })
    .then((res) => res.data);

  __cache.set('genres', data);

  return data;
}
