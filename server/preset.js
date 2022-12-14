const config = require('./config');
const Seed = require('./database/seed');
const sleep = require('./utils/sleep');

(async () => {
  try {
    await sleep(5 * 1000);
    const { presetGroup } = config;
    for (const [key, group] of Object.entries(presetGroup)) {
      try {
        await Seed.create(group.seed);
        console.log(`[preset]: add ${key} seed`);
      } catch (err) {}
    }
  } catch (err) {
    console.log(err);
  }
})();