import request from 'request';
import { API_BASE_URL } from './common';
import { IGroup } from './types';

export default {
  async get(groupId: string) {
    const item: IGroup = await request(`${API_BASE_URL}/groups/${groupId}`);
    return item;
  },

  async list() {
    const items: IGroup[] = await request(`${API_BASE_URL}/groups`);
    return items;
  },

  async getRelationGroup() {
    const item: IGroup = await request(`${API_BASE_URL}/groups/relation`);
    return item;
  },

  async getDefaultGroup() {
    const item: IGroup = await request(`${API_BASE_URL}/groups/default`);
    return item;
  },

  async remove(groupId: string) {
    await request(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'delete'
    });
  },
}