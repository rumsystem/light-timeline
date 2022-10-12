import request from 'request';
import { API_BASE_URL } from './common';
import { IUser } from './types';

export default {
  async get(groupId: string, userAddress: string) {
    const item: IUser = await request(`${API_BASE_URL}/${groupId}/users/${userAddress}`);
    return item;
  }
}