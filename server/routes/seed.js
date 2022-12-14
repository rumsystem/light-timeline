const router = require('koa-router')();
const { assert, Errors } = require('../utils/validator');
const Group = require('../database/sequelize/group');
const Seed = require('../database/seed');
const { ensurePermission } = require('../middleware/api');

router.post('/', ensurePermission, create);

async function create(ctx) {
  const { url } = ctx.request.body;
  assert(url, Errors.ERR_IS_REQUIRED('url'));
  const groupId = await Seed.create(url);
  ctx.body = await Group.findOne({
    where: {
      groupId
    }
  });
}

module.exports = router;