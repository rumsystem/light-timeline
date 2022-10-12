import request from 'request';
import { API_BASE_URL } from './common';
import { IUser } from './types';
import qs from 'query-string';

export default {
  async get(groupId: string, userAddress: string, options: {
    viewer: string
  }) {
    const item: IUser = await request(`${API_BASE_URL}/${groupId}/users/${userAddress}?${qs.stringify(options)}`);
    return item;
  }
}