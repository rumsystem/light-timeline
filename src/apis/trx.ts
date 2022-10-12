import request from 'request';
import { API_BASE_URL } from './common';
import { ICreateObjectPayload, ICreatePersonPayload } from 'quorum-light-node-sdk';

export default {
  async createObject(payload: ICreateObjectPayload) {
    const res: { trx_id: string } = await request(`${API_BASE_URL}/trx/object`, {
      method: 'POST',
      body: payload
    });
    return res;
  },

  async createPerson(payload: ICreatePersonPayload) {
    const res: { trx_id: string } = await request(`${API_BASE_URL}/trx/person`, {
      method: 'POST',
      body: payload
    });
    return res;
  }
}