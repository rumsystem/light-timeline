import request from 'request';
import { API_BASE_URL } from './common';
import { IPost } from './types';
import qs from 'query-string';

export default {
  async list(groupId: string, options: {
    q?: string;
    minLike?: string;
    minComment?: string;
    userAddress?: string
    viewer?: string
    type?: string
    offset?: number
    limit?: number
  } = {}) {
    const items: IPost[] = await request(`${API_BASE_URL}/${groupId}/posts?${qs.stringify(options)}`);
    return items;
  },

  async get(groupId: string, trxId: string, options: {
    viewer: string | undefined
  }) {
    const item: IPost = await request(`${API_BASE_URL}/${groupId}/posts/${trxId}?${qs.stringify(options)}`);
    return item;
  }
}