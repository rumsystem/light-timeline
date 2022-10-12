const router = require('koa-router')();
const { assert, Errors, throws } = require('../utils/validator');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');

router.post('/object', createObject);
router.post('/person', createPerson);

async function createObject(ctx) {
  const data = ctx.request.body;
  assert(data, Errors.ERR_IS_REQUIRED('data'));
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.create(data);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

async function createPerson(ctx) {
  const data = ctx.request.body;
  assert(data, Errors.ERR_IS_REQUIRED('data'));
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.createPerson(data);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
  
}

module.exports = router;