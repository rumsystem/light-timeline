const router = require('koa-router')();
const { assert, Errors, throws } = require('../utils/validator');
const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');

router.post('/', sendTrx);
router.get('/:trxId', get);

async function sendTrx(ctx) {
  const payload = ctx.request.body;
  assert(payload, Errors.ERR_IS_REQUIRED('payload'));
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.send(ctx.params.groupId, payload);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

async function get(ctx) {
  try {
    ctx.body = await QuorumLightNodeSDK.chain.Trx.get(ctx.params.groupId, ctx.params.trxId);
  } catch (err) {
    console.log(err);
    throws(Errors.ERR_IS_REQUEST_FAILED());
  }
}

module.exports = router;