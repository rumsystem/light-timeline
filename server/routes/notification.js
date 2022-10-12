const router = require('koa-router')();
const Notification = require('../database/notification');

router.get('/:to/:type', list);
router.get('/:to/:type/unread_count', getUnreadCount);

async function list(ctx) {
  const where = {
    groupId: ctx.params.groupId,
    to: ctx.params.to,
    type: ctx.params.type,
  };
  const notifications = await Notification.list({
    where,
    order: [
      ['timestamp', 'DESC']
    ],
    limit: Math.min(~~ctx.query.limit || 10, 50),
    offset: ctx.query.offset || 0
  });
  await Notification.markAsRead(notifications.map(n => n.id));
  ctx.body = await Promise.all(notifications.map(n => Notification.appendExtra(n)));
}

async function getUnreadCount(ctx) {
  const count = await Notification.getUnreadCount({
    groupId: ctx.params.groupId,
    to: ctx.params.to,
    type: ctx.params.type,
  });
  ctx.body = count;
}

module.exports = router;