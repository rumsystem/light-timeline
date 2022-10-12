const { Op } = require("sequelize");
const Profile = require('./sequelize/profile');
const getDefaultProfile = require('../utils/getDefaultProfile');
const config = require('../config');

exports.upsert = async (item) => {
  const where = {
    groupId: item.groupId,
    userAddress: item.userAddress,
  };
  const exist = await Profile.findOne({
    where
  });
  if (exist) {
    await Profile.update({
      name: item.name,
      avatar: item.avatar
    }, {
      where
    })
  } else {
    await Profile.create(item);
  }
};

exports.get = async (index, options = {}) => {
  const item = await Profile.findOne({
    where: index
  });
  if (!item) {
    return null;
  }
  return  pack(item.toJSON(), options);
};

exports.bulkGet = async (indexes, options ={}) => {
  if (indexes.length === 0) {
    return [];
  }
  const items = await Profile.findAll({
    where: {
      [Op.or]: indexes
    }
  });
  return items.map(item => pack(item.toJSON(), options));
};

const pack = (profile, options = {}) => {
  profile.avatar = profile.avatar || getDefaultProfile(profile.userAddress).avatar;
  return options.withReplacedImage ? replaceImage(profile) : profile;
}

const replaceImage = profile => {
  if (profile.avatar.startsWith('data:')) {
    profile.avatar = `${config.serverOrigin || ''}/api/${profile.groupId}/images/profiles/${profile.userAddress}`
  }
  return profile;
}