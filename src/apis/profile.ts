import request from 'request';
import { API_BASE_URL } from './common';
import { IProfile } from './types';

export default {
  async get(groupId: string, userAddress: string) {
    const item: IProfile = await request(`${API_BASE_URL}/${groupId}/profiles/${userAddress}`);
    return item;
  },

  async exist(groupId: string, userAddress: string) {
    const item: boolean = await request(`${API_BASE_URL}/${groupId}/profiles/${userAddress}/exist`);
    return item;
  }
}