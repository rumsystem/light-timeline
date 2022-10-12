const router = require('koa-router')();
const Content = require('../database/sequelize/content');

router.get('/:groupId', list);

async function list(ctx) {
  const contents = await Content.findAll({
    where: {
      groupId: ctx.params.groupId
    },
    limit: Math.min(~~ctx.query.limit || 10, 100),
    offset: ctx.query.offset || 0,
    order: [
      ['id', 'DESC']
    ]
  });
  ctx.body = contents;
}

module.exports = router;