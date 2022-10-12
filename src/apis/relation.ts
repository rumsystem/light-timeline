import request from 'request';
import { API_BASE_URL } from './common';
import { IRelation } from './types';
import qs from 'query-string';

export default {
  async listFollowing(groupId: string, userAddress: string, options: {
    limit: number,
    offset: number
  }) {
    const item = await request(`${API_BASE_URL}/${groupId}/relations/${userAddress}/following?${qs.stringify(options || {})}`);
    return item as IRelation[];
  },


  async listFollowers(groupId: string, userAddress: string, options: {
    limit: number,
    offset: number
  }) {
    const item = await request(`${API_BASE_URL}/${groupId}/relations/${userAddress}/followers?${qs.stringify(options || {})}`);
    return item as IRelation[];
  },

  async listMuted(groupId: string, userAddress: string, options: {
    limit: number,
    offset: number
  }) {
    const item = await request(`${API_BASE_URL}/${groupId}/relations/${userAddress}/muted?${qs.stringify(options || {})}`);
    return item as IRelation[];
  }
}