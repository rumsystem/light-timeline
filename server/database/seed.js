const { assert, Errors } = require('../utils/validator');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const Group = require('./sequelize/group');
const Seed = require('./sequelize/seed');

exports.create = async (url) => {
  const existGroup = await Seed.findOne({
    where: {
      url
    }
  });
  assert(!existGroup, Errors.ERR_IS_DUPLICATED('url'));
  const { groupId, chainAPIs, groupName } = QuorumLightNodeSDK.utils.seedUrlToGroup(url);
  assert(chainAPIs.length > 0, Errors.ERR_IS_REQUIRED('chainAPIs'));
  await Seed.create({
    url,
    groupId,
    groupName,
  });
  const seeds = await Seed.findAll({
    where: {
      groupId
    }
  });
  const baseSeedUrl = seeds[0].url.split('&u=')[0];
  const apiMap = {};
  for (const seed of seeds) {
    const group = QuorumLightNodeSDK.utils.seedUrlToGroup(seed.url);
    for (const api of group.chainAPIs) {
      const origin = new URL(api).origin;
      apiMap[origin] = api;
    }
  }
  const combinedSeedUrl = `${baseSeedUrl}&u=${Object.values(apiMap).join('|')}`;
  const group = await Group.findOne({
    where: {
      groupId
    }
  });
  if (group) {
    await Group.update({
      seedUrl: combinedSeedUrl
    }, {
      where: {
        groupId
      }
    });
  } else {
    await Group.create({
      seedUrl: combinedSeedUrl,
      groupId,
      groupName,
      startTrx: '',
      status: '',
      loaded: false,
      contentCount: 0
    });
  }
  QuorumLightNodeSDK.cache.Group.remove(groupId);
  QuorumLightNodeSDK.cache.Group.add(combinedSeedUrl);
  return groupId;
}