const router = require('koa-router')();
const Profile = require('../database/profile');
const getDefaultProfile = require('../utils/getDefaultProfile');

router.get('/:userAddress', get);
router.get('/:userAddress/exist', exist);

async function get(ctx) {
  const profile = await Profile.get({
    groupId: ctx.params.groupId,
    userAddress: ctx.params.userAddress
  });
  ctx.body = profile || getDefaultProfile(ctx.params.userAddress);
}

async function exist(ctx) {
  const profile = await Profile.get({
    groupId: ctx.params.groupId,
    userAddress: ctx.params.userAddress
  });
  ctx.body = !!profile;
}

module.exports = router;