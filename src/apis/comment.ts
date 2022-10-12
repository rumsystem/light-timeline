import request from 'request';
import { API_BASE_URL } from './common';
import { IComment } from './types';
import qs from 'query-string';

export default {
  async list(groupId: string, options: {
    objectId: string;
    viewer?: string
    offset?: number
    limit?: number
  }) {
    const items: IComment[] = await request(`${API_BASE_URL}/${groupId}/comments?${qs.stringify(options)}`);
    return items;
  },

  async get(groupId: string, trxId: string) {
    const item: IComment = await request(`${API_BASE_URL}/${groupId}/comments/${trxId}`);
    return item;
  }
}