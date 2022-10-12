const { Op } = require("sequelize");
const Profile = require('./sequelize/profile');
const getDefaultProfile = require('../utils/getDefaultProfile');

exports.upsert = async (item) => {
  await Profile.upsert(item, {
    fields: ["name", "avatar"]
  });
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