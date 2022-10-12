const Post = require('./sequelize/post');
const { keyBy } = require('lodash');
const Profile = require('./profile');
const UniqueCounter = require('./uniqueCounter');
const getDefaultProfile = require('../utils/getDefaultProfile');
const config = require('../config');

exports.create = async (item) => {
  return await Post.create(item);
};

exports.update = async (trxId, data) => {
  return await Post.update(data, {
    where: {
      trxId
    }
  });
};

exports.replaceUpdatedTrxId = async (trxId, newTrxId) => {
  return await Post.update({
    latestTrxId: newTrxId
  }, {
    where: {
      latestTrxId: trxId
    }
  });
}

exports.get = async (trxId, options = {}) => {
  const item = await Post.findOne({
    where: {
      trxId
    }
  });
  if (!item) {
    return null;
  }
  const result = options.withReplacedImage ? replaceImages(item.toJSON()) : item.toJSON();
  if (options.withExtra) {
    return (await bulkAppendExtra([result], {
      viewer: options.viewer
    }))[0];
  }
  return result;
};

exports.destroy = async (trxId) => {
  await Post.destroy({
    where: {
      trxId
    }
  });
};

exports.list = async (query, options = {}) => {
  const items = await Post.findAll(query);
  const result = items.map(item => options.withReplacedImage ? replaceImages(item.toJSON()) : item.toJSON());
  if (options.withExtra) {
    return await bulkAppendExtra(result, {
      viewer: options.viewer
    });
  }
}

const bulkAppendExtra = async (items, options = {}) => {
  items = items.map((item) => {
    item.extra = item.extra || {};
    return item;
  });

  if (options.viewer) {
    const likedMap = await getCounterMap({
      counterName: 'postLike',
      userAddress: options.viewer,
      items
    });
    items = items.map((item) => {
      item.extra = item.extra || {};
      item.extra.liked = !!likedMap[item.trxId]
      return item;
    });
  }

  const profiles = await Profile.bulkGet(items.map((item) => ({
    groupId: item.groupId,
    userAddress: item.userAddress
  })), {
    withReplacedImage: true
  });
  const profileMap = keyBy(profiles, 'userAddress');
  items = items.map((item) => {
    item.extra.userProfile = profileMap[item.userAddress] || getDefaultProfile(item.userAddress)
    return item;
  });
  return items;
}

const getCounterMap = async (p) => {
  const counters = await UniqueCounter.bulkGet(p.items.map((item) => ({
    name: p.counterName,
    objectId: item.trxId,
    userAddress: p.userAddress
  })));
  return keyBy(counters, (counter) => counter.objectId);
}

const replaceImages = item => {
  if (item.images) {
    item.images = item.images.map((_, index) => `${config.serverOrigin || ''}/api/${item.groupId}/images/posts/${item.trxId}/${index}`);
  }
  return item;
}

exports.count = async (where) => {
  return await Post.count({
    where
  });
};