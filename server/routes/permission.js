const router = require('koa-router')();
const axios = require('axios');
const JsSHA = require('jssha');
const config = require('../config');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const { assert, Errors } = require('../utils/validator');
const logger = require('../utils/logger');

router.get('/:pubKey', get);
router.post('/:pubKey', tryAdd);

async function get(ctx) {
  const { groupId, pubKey } = ctx.params;
  const allow = await getChainAuth(groupId, pubKey);
  console.log(`[getAllow]:`, { allow });
  logger.info(`${ctx.headers['x-address'] || ''} getAllow`);
  logger.info({ allow });
  assert(allow, Errors.ERR_NOT_FOUND('allow'));
  ctx.body = true;
}

async function tryAdd(ctx) {
  const { groupId, pubKey } = ctx.params;
  const accessToken = ctx.query.access_token;
  assert(accessToken, Errors.ERR_IS_REQUIRED('accessToken'));
  console.log(`[get permission]:`, { accessToken });
  logger.info(`${ctx.headers['x-address'] || ''} get permission`);
  logger.info({ accessToken });
  const userId = await getUserId(accessToken);
  console.log(`getUserId:`, { userId });
  assert(userId, Errors.ERR_IS_INVALID('userId'));
  const nft = await getNFT(userId, accessToken, config.nft.collection_id);
  console.log(`[getNFT]:`, { nft });
  logger.info(`${ctx.headers['x-address'] || ''} get target nft`);
  logger.info({ nft });
  assert(nft, Errors.ERR_NOT_FOUND(`${JSON.stringify(config.nft)} nft`));
  const allow = await getChainAuth(groupId, pubKey);
  logger.info(`${ctx.headers['x-address'] || ''} getAllow`);
  logger.info({ allow });
  if (allow) {
    ctx.body = { nft, allow };
    logger.info(`${ctx.headers['x-address'] || ''} tryAdd return body`);
    logger.info({ nft, allow });
  } else {
    await updateChainAuth(ctx.params.groupId, ctx.params.pubKey, 'add');
    ctx.body = { nft };
    logger.info(`${ctx.headers['x-address'] || ''} tryAdd return body`);
    logger.info({ nft });
  }
}

const getChainAuth = async (groupId, pubKey) => {
  try {
    const { permissionRequired, chainApiToken } = getPresetGroup(groupId);
    assert(permissionRequired, Errors.ERR_NOT_FOUND('permissionRequired'));
    assert(chainApiToken, Errors.ERR_NOT_FOUND('chainApiToken'));
    const group = QuorumLightNodeSDK.cache.Group.get(groupId);
    assert(group, Errors.ERR_NOT_FOUND('group'));
    const { origin } = new URL(group.chainAPIs[0]);
    const res = await axios.get(`${origin}/api/v1/group/${groupId}/trx/allowlist`, {
      headers: {
        Authorization: `Bearer ${chainApiToken}`,
      },
    });
    const allowList = res.data || [];
    console.log(`[getChainAuth]:`, { allowList });
    return allowList.find(item => item.Pubkey === pubKey) || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

const updateChainAuth = async (groupId, pubKey, action) => {
  try {
    const { permissionRequired, chainApiToken } = getPresetGroup(groupId);
    assert(permissionRequired, Errors.ERR_NOT_FOUND('permissionRequired'));
    assert(chainApiToken, Errors.ERR_NOT_FOUND('chainApiToken'));
    const group = QuorumLightNodeSDK.cache.Group.get(groupId);
    assert(group, Errors.ERR_NOT_FOUND('group'));
    const payload = {
      group_id: groupId,
      type: 'upd_alw_list',
      config: JSON.stringify({
        action,
        pubkey: pubKey,
        trx_type: ['post'],
        memo: ''
      })
    };
    const { origin } = new URL(group.chainAPIs[0]);
    const res = await axios.post(`${origin}/api/v1/group/chainconfig`, payload, {
      headers: {
        Authorization: `Bearer ${chainApiToken}`,
      },
    });
    console.log(`[updateChainAuth]:`, { 'res.data': res.data });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const getPresetGroup = groupId => {
  const presetGroups = Object.values(config.presetGroup);
  return presetGroups.find(presetGroup => {
    const group = QuorumLightNodeSDK.utils.seedUrlToGroup(presetGroup.seed);
    return groupId === group.groupId;
  });
}

async function getOutputs(token, ids) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const resp = await axios.get(`https://mixin-api.zeromesh.net/collectibles/outputs?members=${hashMembers(ids)}&threshold=1&state=unspent`, config)
  if (resp.data) {
    return resp.data.data
  }
}

async function getUserId(token) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const resp = await axios.get(`https://mixin-api.zeromesh.net/me`, config);
  try {
    logger.info(`get mixin user`);
    logger.info(resp.data);
    return resp.data.data.user_id;
  } catch (err) {
    console.log(resp.data);
    logger.info(`get mixin user`);
    logger.info(resp.data);
    return '';
  }
};

async function getNFT(userId, token, collectionId) {
  const outputs = await getOutputs(token, [userId]);
  console.log(`[getNFT]:`, { outputs });
  for (const output of outputs) {
    try {
      if (output.token_id) {
        const nft = await getNFTToken(token, output.token_id);
        logger.info(`fetch nft info`);
        logger.info({ nft });
        if (nft.collection_id === collectionId) {
          return nft;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  return null;
}

async function getNFTToken(token, id) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const resp = await axios.get(`https://mixin-api.zeromesh.net/collectibles/tokens/${id}`, config)
  if (resp.data) {
    return resp.data.data
  }
};

const hashMembers = (ids) => {
  const key = ids.sort().join('');
  const sha = new JsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });
  sha.update(key);
  return sha.getHash('HEX');
};

module.exports = router;