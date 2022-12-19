const router = require('koa-router')();
const config = require('../config');

router.get('/', get);

async function get(ctx) {
  ctx.body = {
    title: config.title || '',
    logo: config.logo || '',
    version: config.version || '1.0.0'
  };
}

module.exports = router;