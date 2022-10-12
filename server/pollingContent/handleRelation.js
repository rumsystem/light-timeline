const Relation = require('../database/sequelize/relation');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');

module.exports = async (item) => {
  const relation = pack(item);
  const { type } = relation;
  if (type === 'follow') {
    await Relation.findOrCreate({
      where: relation
    });
  }
  if (type === 'unfollow') {
    await Relation.destroy({
      where: relation
    });
  }
  if (type === 'mute') {
    await Relation.findOrCreate({
      where: relation
    });
  }
  if (type === 'unmute') {
    await Relation.destroy({
      where: relation
    });
  }
}

const pack = (item) => {
  const { to, type } = JSON.parse(item.Data);
  const data = {
    type,
    to,
    from: QuorumLightNodeSDK.utils.pubkeyToAddress(item.SenderPubkey)
  };
  return data;
}