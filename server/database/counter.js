const { Op } = require("sequelize");
const Counter = require('./sequelize/counter');

exports.create = async (item) => {
  await Counter.create(item);
};

exports.bulkGet = async (trxIds) => {
  return await Counter.findAll({
    where: {
      trxId: {
        [Op.or]: trxIds
      }
    }
  });
};
