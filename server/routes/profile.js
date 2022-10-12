const router = require('koa-router')();
const Profile = require('../database/profile');
const getDefaultProfile = require('../utils/getDefaultProfile');

router.get('/:userAddress', get);

async function get(ctx) {
  const profile = await Profile.get({
    groupId: ctx.params.groupId,
    userAddress: ctx.params.userAddress
  });
  ctx.body = profile || getDefaultProfile(ctx.params.userAddress);
}

module.exports = router;