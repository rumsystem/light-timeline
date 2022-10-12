const router = require('koa-router')();
const Post = require('../database/post');

router.get('/:userAddress', get);

async function get(ctx) {
  const postCount = await Post.count({
    groupId: ctx.params.groupId,
    userAddress: ctx.params.userAddress,
  });
  ctx.body = {
    postCount
  };
}

module.exports = router;