const router = require('koa-router')();
const Post = require('../database/post');
const Relation = require('../database/sequelize/relation');

router.get('/:userAddress', get);

async function get(ctx) {
  const [
    postCount,
    followingCount,
    followerCount,
    following,
    muted
  ] = await Promise.all([
    Post.count({
      groupId: ctx.params.groupId,
      userAddress: ctx.params.userAddress,
    }),
    Relation.count({
      where: {
        type: 'following',
        from: ctx.params.userAddress
      }
    }),
    Relation.count({
      where: {
        type: 'following',
        to: ctx.params.userAddress
      }
    }),
    Relation.findOne({
      where: {
        type: 'following',
        to: ctx.params.userAddress,
        from: ctx.query.viewer || ''
      }
    }),
    Relation.findOne({
      where: {
        type: 'muted',
        to: ctx.params.userAddress,
        from: ctx.query.viewer || ''
      }
    })
  ]);
  ctx.body = {
    postCount,
    followingCount,
    followerCount,
    following: !!following,
    muted: !!muted
  };
}

module.exports = router;