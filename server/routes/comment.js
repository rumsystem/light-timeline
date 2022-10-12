const router = require('koa-router')();
const Comment = require('../database/comment');
const { assert, Errors } = require('../utils/validator');
const truncate = require('../utils/truncate');
const { Op } = require("sequelize");
const { groupBy } = require('lodash');

router.get('/:trxId', get);
router.get('/', list);

async function get(ctx) {
  const trxId = ctx.params.trxId;
  const comment = await Comment.get(trxId, { withExtra: true });
  assert(comment, Errors.ERR_NOT_FOUND('comment'));
  ctx.body = comment;
}

async function list(ctx) {
  const query = {
    where: {
      groupId: ctx.params.groupId
    },
    limit: Math.min(~~ctx.query.limit || 10, 100),
    offset: ctx.query.offset || 0,
    order: [
      ['timestamp', ctx.query.order === 'DESC' ? 'DESC' : 'ASC']
    ],
  };
  if (ctx.query.objectId) {
    query.where.objectId = ctx.query.objectId;
    query.where.threadId = '';
  }
  let comments = await Comment.list(query, {
    withExtra: true,
    viewer: ctx.query.viewer
  });
  const subCommentTrxIds = comments.map(item => item.trxId);
  let subComments = subCommentTrxIds.length > 0 ? await Comment.list({
    where: {
      threadId: {
        [Op.or]: subCommentTrxIds
      }
    }
  }, {
    withExtra: true,
    viewer: ctx.query.viewer
  }) : [];
  comments = comments.map((item) => {
    if (ctx.query.truncatedLength) {
      item.content = truncate(item.content, ~~ctx.query.truncatedLength)
    }
    const subItemsMap = groupBy(subComments, 'threadId');
    if (subItemsMap[item.trxId]) {
      item.extra.comments = subItemsMap[item.trxId];
    }
    return item;
  });
  ctx.body = comments;
}

module.exports = router;