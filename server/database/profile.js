const { Op } = require("sequelize");
const Profile = require('./sequelize/profile');
const getDefaultProfile = require('../utils/getDefaultProfile');

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

exports.get = async (index) => {
  const item = await Profile.findOne({
    where: index
  });
  if (!item) {
    return null;
  }
  return pack(item.toJSON());
};

exports.bulkGet = async (indexes) => {
  if (indexes.length === 0) {
    return [];
  }
  const items = await Profile.findAll({
    where: {
      [Op.or]: indexes
    }
  });
  return items.map(item => pack(item.toJSON()));
};

const pack = profile => {
  profile.avatar = profile.avatar || getDefaultProfile(profile.userAddress).avatar;
  return profile
}