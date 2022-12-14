const UniqueCounter = require('../database/uniqueCounter');
const Post = require('../database/post');
const Comment = require('../database/comment');
const Notification = require('../database/notification');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const { trySendSocket } = require('../socket');

const CounterName = {
  like: 'like',
}

module.exports = async (item, group) => {
  const counter = await pack(item);

  if (!counter) {
    return;
  }

  const { objectId, value, name } = counter;
  const from = counter.userAddress;
  const uniqueCounter = {
    name,
    objectId,
    userAddress: from
  };
  if (value > 0) {
    await UniqueCounter.upsert(uniqueCounter);
  } else if (value < 0) {
    await UniqueCounter.destroy(uniqueCounter);
  }

  const post = await Post.get(objectId);
  if (post) {
    const count = await UniqueCounter.count({
      where: {
        name,
        objectId: post.trxId
      }
    });
    if (name === CounterName.like) {
      post.likeCount = count;
    }
    await Post.update(post.trxId, post);
    if (value > 0 && from !== post.userAddress) {
      const notification = {
        groupId: '',
        status: group.loaded ? 'unread' : 'read',
        type: 'like',
        toObjectId: post.trxId,
        toObjectType: 'post',
        to: post.userAddress,
        from,
        fromObjectId: '',
        fromObjectType: '',
        timestamp: Date.now()
      };
      await Notification.create(notification);
      if (group.loaded) {
        trySendSocket(notification.to, 'notification', notification);
      }
    }
  }

  const comment = await Comment.get(objectId);
  if (comment) {
    const count = await UniqueCounter.count({
      where: {
        name,
        objectId: comment.trxId
      }
    });
    if (name === CounterName.like) {
      comment.likeCount = count;
    }
    await Comment.update(comment.trxId, comment);
    if (value > 0 && from !== comment.userAddress) {
      const notification = {
        groupId: '',
        status: group.loaded ? 'unread' : 'read',
        type: 'like',
        toObjectId: comment.trxId,
        toObjectType: 'comment',
        to: comment.userAddress,
        from,
        fromObjectId: '',
        fromObjectType: '',
        timestamp: Date.now()
      };
      await Notification.create(notification);
      if (group.loaded) {
        trySendSocket(notification.to, 'notification', notification);
      }
    }
  }
}

const pack = async (item) => {
  const { id, type } = item.Data;
  const data = {
    objectId: id,
    value: type === 'Like' ? 1 : -1,
    name: 'like',
    userAddress: QuorumLightNodeSDK.utils.pubkeyToAddress(item.SenderPubkey),
    groupId: item.GroupId,
    trxId: item.TrxId
  }
  return data;
}