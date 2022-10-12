const router = require('koa-router')();
const Group = require('../database/sequelize/group');
const { assert, Errors } = require('../utils/validator');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const { shuffle } = require('lodash');

router.get('/:groupId', get);
router.get('/:groupId/shuffle', shuffleChainApi);
router.get('/', list);

async function get(ctx) {
  const group = await Group.findOne({
    where: {
      groupId: ctx.params.groupId
    }
  });
  assert(group, Errors.ERR_NOT_FOUND('group'));
  ctx.body = pack(group.toJSON());
}

async function list(ctx) {
  const groups = await Group.findAll({
    order: [
      ['contentCount', 'DESC']
    ]
  });
  ctx.body = groups.map((group) => pack(group.toJSON()));
}

async function shuffleChainApi(ctx) {
  const { groupId } = ctx.params;
  const group = await Group.findOne({
    where: {
      groupId
    }
  });
  assert(group, Errors.ERR_NOT_FOUND('group'));
  const [ baseUrl, chainUrl ] = group.seedUrl.split('&u=');
  const chainAPIs = shuffle(chainUrl.split('|'));
  const seedUrl = baseUrl + '&u=' + chainAPIs.join('|');
  await Group.update({
    seedUrl
  }, {
    where: {
      groupId
    }
  })
  QuorumLightNodeSDK.cache.Group.remove(groupId);
  QuorumLightNodeSDK.cache.Group.add(seedUrl);
  ctx.body = chainAPIs;
}

const pack = group => {
  const rawGroup = QuorumLightNodeSDK.cache.Group.get(group.groupId);
  const [ baseUrl ] = group.seedUrl.split('&u=');
  const seedUrl = baseUrl + '&u=' + rawGroup.chainAPIs.join('|');
  return {
    ...group,
    seedUrl,
    extra: {
      rawGroup
    }
  };
}

module.exports = router;