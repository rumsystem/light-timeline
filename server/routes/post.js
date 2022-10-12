const router = require('koa-router')();
const Post = require('../database/post');
const truncate = require('../utils/truncate');
const { assert, Errors } = require('../utils/validator');

router.get('/:trxId', get);
router.get('/', list);

async function get(ctx) {
  const trxId = ctx.params.trxId;
  const post = await Post.get(trxId, { withExtra: true });
  assert(post, Errors.ERR_NOT_FOUND('post'));
  ctx.body = post;
}

async function list(ctx) {
  const where = {
    groupId: ctx.params.groupId,
    latestTrxId: '',
  };

  if (ctx.query.userAddress) {
    where.userAddress = ctx.query.userAddress;
  }
  
  let posts = await Post.list({
    where,
    order: [
      ['timestamp', ctx.query.order === 'ASC' ? 'ASC' : 'DESC']
    ],
    limit: Math.min(~~ctx.query.limit || 10, 100),
    offset: ctx.query.offset || 0
  }, {
    withExtra: true,
    viewer: ctx.query.viewer
  });
  if (ctx.query.truncatedLength) {
    posts = posts.map((item) => {
      item.content = truncate(item.content, ~~ctx.query.truncatedLength)
      return item;
    })
  }
  ctx.body = posts;
}

module.exports = router;