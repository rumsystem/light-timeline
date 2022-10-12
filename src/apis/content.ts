import request from 'request';
import { API_BASE_URL } from './common';
import { IContent } from './types';
import qs from 'query-string';

export default {
  async list(groupId: string, options: {
    offset: number
    limit: number
  }) {
    const items: IContent[] = await request(`${API_BASE_URL}/contents/${groupId}?${qs.stringify(options)}`);
    return items;
  },
}