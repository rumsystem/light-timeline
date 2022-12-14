const router = require('koa-router')();
const { assert, Errors, throws } = require('../utils/validator');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const ethers = require('ethers');
const { Base64 } = require('js-base64');
const axios = require('axios');

router.post('/', sendTrx);
router.get('/:trxId', get);
router.post('/object', createObject);
router.post('/person', createPerson);

async function createObject(ctx) {
  let data = ctx.request.body;
  assert(data, Errors.ERR_IS_REQUIRED('data'));
  const { jwt, eth_pub_key } = data;
  if (jwt && eth_pub_key) {
    delete data.jwt;
    delete data.eth_pub_key;
    data = {
      ...data,
      ...getTrxCreateParam(eth_pub_key, jwt)
    }
  }
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.create(data);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

async function createPerson(ctx) {
  let data = ctx.request.body;
  assert(data, Errors.ERR_IS_REQUIRED('data'));
  const { jwt, eth_pub_key } = data;
  if (jwt && eth_pub_key) {
    delete data.jwt;
    delete data.eth_pub_key;
    data = {
      ...data,
      ...getTrxCreateParam(eth_pub_key, jwt)
    }
  }
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.createPerson(data);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

const getTrxCreateParam = (ethPubKey, jwt) => {
  const VAULT_API_BASE_URL = 'https://vault.rumsystem.net/v1';
  const VAULT_APP_ID = 1065804423237;
  const compressedPublicKey = ethers.utils.arrayify(ethers.utils.computePublicKey(ethPubKey, true));
  const publicKey = Base64.fromUint8Array(compressedPublicKey, true);
  return {
    publicKey,
    sign: async (m) => {
      const res = await axios.post(`${VAULT_API_BASE_URL}/app/user/sign`, {
        appid: VAULT_APP_ID,
        hash: `0x${m}`
      }, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log(` ------------- remote sign ---------------`);
      console.log(res.data);
      return res.data.signature.replace(/^0x/, '');
    },
  };
}

async function sendTrx(ctx) {
  const payload = ctx.request.body;
  assert(payload, Errors.ERR_IS_REQUIRED('payload'));
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.send(ctx.params.groupId, payload);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

async function get(ctx) {
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.get(ctx.params.groupId, ctx.params.trxId);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

module.exports = router;