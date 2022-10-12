const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const sleep = require('../utils/sleep');
const handlePost = require('./handlePost');
const handleComment = require('./handleComment');
const handleCounter = require('./handleCounter');
const handleProfile = require('./handleProfile');
const getTrxType = require('../utils/getTrxType');
const Content = require('../database/sequelize/content');
const Group = require('../database/sequelize/group');

const LIMIT = 500;

module.exports = (duration) => {
  let stop = false;

  QuorumLightNodeSDK.cache.Group.clear();

  (async () => {
    while (!stop) {
      const groups = await Group.findAll();
      for (const group of groups) {
        QuorumLightNodeSDK.cache.Group.add(group.seedUrl);
      }
      for (const group of groups) {
        const where = { groupId: group.groupId };
        try {
          const listOptions = {
            groupId: group.groupId,
            count: LIMIT,
          };
          if (group.startTrx) {
            listOptions.startTrx = group.startTrx;
          }
          const contents = await QuorumLightNodeSDK.chain.Content.list(listOptions);
          if (contents.length > 0) {
            await handleContents(group, contents.sort((a, b) => a.TimeStamp - b.TimeStamp));
            const contentCount = await Content.count({ where });
            await Group.update({ contentCount }, { where });
          }
          await Group.update({ status: 'connected' }, { where });
          if (!group.loaded && (contents.length === 0 || contents.length < LIMIT)) {
            await Group.update({ loaded: true }, { where });
          }
        } catch (err) {
          await Group.update({ status: 'disconnected' }, { where });
          if (err.code !== 'ECONNREFUSED') {
            console.log(err);
          }
        }
      }
      await sleep(duration);
    }
  })();
}

const handleContents = async (group, contents) => {
  const { groupId } = group;
  try {
    for (const content of contents) {
      let log = '';
      try {
        const existContent = await Content.findOne({
          where: {
            TrxId: content.TrxId
          }
        });
        if (existContent) {
          continue;
        }
        const type = getTrxType(content);
        switch(type) {
          case 'post': await handlePost(content, group); break;
          case 'comment': await handleComment(content, group); break;
          case 'counter': await handleCounter(content, group); break;
          case 'profile': await handleProfile(content); break;
          default: break;
        }
        console.log(`${content.TrxId} ✅`);
      } catch (err) {
        console.log(content);
        console.log(err);
        log = err;
        console.log(`${content.TrxId} ❌ ${err.message}`);
      }
      try {
        await Content.create({
          ...content,
          groupId,
          log
        });
      } catch (err) {
        console.log(err);
      }
    }
    await Group.update({
      startTrx: contents[contents.length - 1].TrxId
    }, {
      where: {
        groupId
      }
    });
  } catch (err) {
    console.log(err);
  }
}
