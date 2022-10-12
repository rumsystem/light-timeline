import request from 'request';
import { API_BASE_URL } from './common';
import { ICreateObjectPayload, ICreatePersonPayload, ITrx } from 'quorum-light-node-sdk';

export default {
  async createObject(payload: ICreateObjectPayload) {
    const res: { trx_id: string } = await request(`${API_BASE_URL}/${payload.groupId}/trx/object`, {
      method: 'POST',
      body: payload
    });
    return res;
  },

  async createPerson(payload: ICreatePersonPayload) {
    const res: { trx_id: string } = await request(`${API_BASE_URL}/${payload.groupId}/trx/person`, {
      method: 'POST',
      body: payload
    });
    return res;
  },

  async get(groupId: string, trxId: string) {
    const res: ITrx = await request(`${API_BASE_URL}/${groupId}/trx/${trxId}`);
    return res;
  }
}