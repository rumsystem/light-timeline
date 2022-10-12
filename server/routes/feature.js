const router = require('koa-router')();
const Feature = require('../database/sequelize/feature');
const Activity = require('../database/sequelize/activity');
const { Op } = require("sequelize");

router.get('/:userAddress', list);

async function list(ctx) {
  const { userAddress } = ctx.params;
  const activity = await Activity.findOne({
    where: {
      userAddress
    }
  });
  const lastActiveAt = activity ? activity.lastActiveAt : Date.now();
  const features = await Feature.findAll({
    where: {
      createdAt: {
        [Op.gte]: lastActiveAt
      }
    }
  });
  await Activity.upsert({
    userAddress,
    lastActiveAt: Date.now()
  });
  ctx.body = features;
}

module.exports = router;