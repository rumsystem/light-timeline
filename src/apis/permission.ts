import request from 'request';
import { API_BASE_URL } from './common';

export default {
  async get(groupId: string, pubKey: string) {
    await request(`${API_BASE_URL}/${groupId}/permission/${pubKey}`);
  },

  async tryAdd(groupId: string, pubKey: string, accessToken: string) {
    const res = await request(`${API_BASE_URL}/${groupId}/permission/${pubKey}?access_token=${accessToken}`, {
      method: 'POST'
    });
    return res as {
      nft: {
        collection_id: string
        created_at: string
        group: string
        meta: {
          description: string
          group: string
          hash: string
          icon_url: string
          media_url: string
          mime: string
          name: string
        }
        mixin_id: string
        nfo: string
        receivers: string[]
        receivers_threshold: number
        token: string
        token_id: string
        type: string
      },
      allow?: {
        GroupOwnerPubkey: string
        GroupOwnerSign: string
        Memo: string
        Pubkey: string
        TimeStamp: number
      }
    };
  },
}