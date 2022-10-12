const Post = require('../database/post');
const Comment = require('../database/comment');
const UniqueCounter = require('../database/uniqueCounter');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const { getSocketIo } = require('../socket');

module.exports = async (item, group) => {
  const { post, extra } = await pack(item);

  if (extra.updatedTrxId) {
    const updatedPost = await Post.get(extra.updatedTrxId);
    if (!updatedPost) {
      return;
    }
    if (post.userAddress !== updatedPost.userAddress) {
      return;
    }
    await Post.create({
      ...post,
      latestTrxId: '',
      commentCount: updatedPost.commentCount,
      hotCount: updatedPost.hotCount,
      likeCount: updatedPost.likeCount,
      timestamp: updatedPost.timestamp,
    });
    await Post.update(updatedPost.trxId, {
      latestTrxId: post.trxId
    });
    await Post.replaceUpdatedTrxId(updatedPost.trxId, post.trxId);
    await Comment.replaceObjectId(updatedPost.trxId, post.trxId);
    await UniqueCounter.replaceObjectId(updatedPost.trxId, post.trxId);
    if (group.loaded) {
      await notify(post.trxId);
    }
    return;
  }
  if (extra.deletedTrxId) {
    const deletedPost = await Post.get(extra.deletedTrxId);
    if (!deletedPost) {
      return;
    }
    if (post.userAddress !== deletedPost.userAddress) {
      return;
    }
    await Post.destroy(extra.deletedTrxId);
    return;
  }
  await Post.create(post);
  if (group.loaded) {
    await notify(post.trxId);
  }
}

const pack = async item => {
  const {
    id,
    content,
    image
  } = item.Data;
  const post = {
    content,
    userAddress: QuorumLightNodeSDK.utils.pubkeyToAddress(item.SenderPubkey),
    groupId: item.GroupId,
    trxId: item.TrxId,
    latestTrxId: '',
    storage: 'chain',
    commentCount: 0,
    hotCount: 0,
    likeCount: 0,
    timestamp: parseInt(String(item.TimeStamp / 1000000), 10)
  }
  if (image) {
    post.images = image;
  }
  const extra = {};
  if (id) {
    if (content === 'OBJECT_STATUS_DELETED') {
      extra.deletedTrxId = id;
    } else {
      extra.updatedTrxId = id;
    }
  }
  return {
    post,
    extra
  };
}

const notify = async (trxId) => {
  const post = await Post.get(trxId, { withExtra: true });
  if (post) {
    getSocketIo().to(post.groupId).emit('post', post);
  }
}