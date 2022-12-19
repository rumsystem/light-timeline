import request from 'request';
import { API_BASE_URL } from './common';
import { ICreateObjectPayload, ICreatePersonPayload, ITrx, utils } from 'quorum-light-node-sdk';
import { ethers } from 'ethers';
import { Base64 } from 'js-base64';

interface IVaultOptions {
  ethPubKey: string
  jwt: string 
}

export default {
  async createObject(p: ICreateObjectPayload, vaultOptions: IVaultOptions | null) {
    const payload = await utils.signTrx({
      type: '_Object',
      ...p,
      data: p.object,
      ...(vaultOptions ? getVaultTrxCreateParam(vaultOptions) : {})
    });
    console.log(payload);
    const res: { trx_id: string } = await request(`${API_BASE_URL}/${p.groupId}/trx`, {
      method: 'POST',
      body: payload,
    });
    return res;
  },

  async createPerson(p: ICreatePersonPayload, vaultOptions: IVaultOptions | null) {
    const payload = await utils.signTrx({
      type: 'Person',
      ...p,
      data: p.person,
      ...(vaultOptions ? getVaultTrxCreateParam(vaultOptions) : {})
    });
    console.log(payload);
    const res: { trx_id: string } = await request(`${API_BASE_URL}/${p.groupId}/trx`, {
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

const getVaultTrxCreateParam = (vaultOptions: IVaultOptions) => {
  const { ethPubKey, jwt } = vaultOptions;
  const VAULT_API_BASE_URL = 'https://vault.rumsystem.net/v1';
  const VAULT_APP_ID = 1065804423237;
  const compressedPublicKey = ethers.utils.arrayify(ethers.utils.computePublicKey(ethPubKey, true));
  const publicKey = Base64.fromUint8Array(compressedPublicKey, true);
  return {
    publicKey,
    sign: async (m: string) => {
      const res = await request(`/app/user/sign`, {
        base: VAULT_API_BASE_URL,
        method: 'POST',
        body: {
          appid: VAULT_APP_ID,
          hash: `0x${m}`
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        } 
      });
      return res.signature.replace(/^0x/, '');
    },
  };
}