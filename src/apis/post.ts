import request from 'request';
import { API_BASE_URL } from './common';
import { IPost } from './types';
import qs from 'query-string';

export default {
  async list(groupId: string, options: {
    userAddress?: string
    viewer?: string
    offset?: number
    limit?: number
  } = {}) {
    const items: IPost[] = await request(`${API_BASE_URL}/${groupId}/posts?${qs.stringify(options)}`);
    return items;
  },

  async get(groupId: string, trxId: string) {
    const item: IPost = await request(`${API_BASE_URL}/${groupId}/posts/${trxId}`);
    return item;
  }
}