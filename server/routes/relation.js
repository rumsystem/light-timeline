
const router = require('koa-router')();
const Relation = require('../database/sequelize/relation');
const Profile = require('../database/profile');
const getDefaultProfile = require('../utils/getDefaultProfile');
const { keyBy } = require('lodash');

router.get('/:userAddress/following', listFollowing);
router.get('/:userAddress/muted', listMuted);

async function listFollowing(ctx) {
  ctx.body = await list(ctx, 'following');
}

async function listMuted(ctx) {
  ctx.body = await list(ctx, 'muted');
}

async function list(ctx, type) {
  let items = await Relation.findAll({
    where: {
      type,
      from: ctx.params.userAddress
    }
  });
  const profiles = await Profile.bulkGet(items.map((item) => ({
    groupId: ctx.params.groupId,
    userAddress: item.to
  })), {
    withReplacedImage: true
  });
  const profileMap = keyBy(profiles, 'userAddress');
  items = items.map((item) => {
    item.extra = {
      userProfile: profileMap[item.userAddress] || getDefaultProfile(item.userAddress)
    }
    return item;
  });
  ctx.body = items
}

module.exports = router;