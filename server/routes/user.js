const router = require('koa-router')();
const Post = require('../database/post');

router.get('/:userAddress', get);

async function get(ctx) {
  const userAddress = ctx.params.userAddress;
  const postCount = await Post.count(userAddress);
  ctx.body = {
    postCount
  };
}

module.exports = router;