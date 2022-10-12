import request from 'request';
import { API_BASE_URL } from './common';
import { INotification, NotificationType } from './types';
import qs from 'query-string';

export default {
  async list(groupId: string, userAddress: string, type: NotificationType, options?: {
    limit: number,
    offset: number
  }) {
    const items: INotification[] = await request(`${API_BASE_URL}/${groupId}/notifications/${userAddress}/${type}?${qs.stringify(options || {})}`);
    return items;
  },

  async getUnreadCount(groupId: string, userAddress: string, type: NotificationType) {
    const count: number = await request(`${API_BASE_URL}/${groupId}/notifications/${userAddress}/${type}/unread_count`);
    return count;
  }
}