const QuorumLightNodeSDK = require('quorum-light-node-sdk-nodejs');
const sleep = require('../utils/sleep');
const handlePost = require('./handlePost');
const handleComment = require('./handleComment');
const handleCounter = require('./handleCounter');
const handleProfile = require('./handleProfile');
const handleRelation = require('./handleRelation');
const getTrxType = require('../utils/getTrxType');
const Content = require('../database/sequelize/content');
const Group = require('../database/sequelize/group');
const config = require('../config');
const { shuffle } = require('lodash');
const moment = require('moment');

const jobShareData = {
  limit: 0,
  activeGroupMap: {},
  handling: false
}

const DEBUG = false;

module.exports = (duration) => {
  let stop = false;
  const jobMap = {};

  QuorumLightNodeSDK.cache.Group.clear();

  (async () => {
    while (!stop) {
      const groups = await Group.findAll();
      for (const group of groups) {
        QuorumLightNodeSDK.cache.Group.add(group.seedUrl);
      }
      if (process.env.NODE_ENV === 'production-debug') {
        stop = true;
        console.log('==================================================');
        console.log('Disabled polling content for production debug mode');
        console.log('==================================================');
        return;
      }
      jobShareData.activeGroupMap = await getActiveGroupMap(groups);
      jobShareData.limit = getLimit(groups);
      DEBUG && console.log({ limit: jobShareData.limit });
      for (const group of groups) {
        if (!jobMap[group.groupId]) {
          jobMap[group.groupId] = startJob(group.groupId, duration);
          await sleep(500);
        }
      }
      await sleep(5 * 1000);
    }
  })();
}

const startJob = async (groupId, duration) => {
  while (true) {
    const group = jobShareData.activeGroupMap[groupId];
    if (group) {
      const isLazyGroup = (config.polling?.lazyGroupIds || []).includes(group.groupId);
      if (isLazyGroup) {
        await sleep(5 * 60 * 1000);
      }
      if (process.env.NODE_ENV === 'production') {
        console.log(`执行同步任务: ${group.groupName}`);
      }
      const where = { groupId: group.groupId };
      try {
        const listOptions = {
          groupId: group.groupId,
          count: jobShareData.limit,
        };
        if (group.startTrx) {
          listOptions.startTrx = group.startTrx;
        }
        const contents = await QuorumLightNodeSDK.chain.Content.list(listOptions);
        while (jobShareData.handling) {
          console.log(`${group.groupName}: 别人正在 handling，我等待 ...`);
          await sleep(200);
        }
        jobShareData.handling = true;
        try {
          if (contents.length > 0) {
            await handleContents(group, contents.sort((a, b) => a.TimeStamp - b.TimeStamp));
            const contentCount = await Content.count({ where });
            await Group.update({ contentCount }, { where });
          }
          await Group.update({ status: 'connected' }, { where });
          if (!group.loaded && contents.length === 0) {
            await Group.update({ loaded: true }, { where });
          }
          DEBUG && console.log(`处理 ${group.groupId} ${group.groupName}, 本次 ${contents.length} 条`);
        } catch(err) {
          throw err;
        } finally {
          jobShareData.handling = false;
        }
      } catch (err) {
        await Group.update({ status: 'disconnected' }, { where });
      }
      await sleep(duration);
    }
    await sleep(duration);
  }
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
          case 'relation': await handleRelation(content); break;
          default: break;
        }
        !DEBUG && console.log(`${content.TrxId} ✅`);
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


const getActiveGroupMap = async groups => {
  const map = {};
  const loadedGroups = groups.filter(group => group.loaded);
  const unloadedGroups = groups.filter(group => !group.loaded);
  const temRandomUnloadedGroups = shuffle(unloadedGroups).slice(0, config.polling?.maxIndexingUnloadedGroup || 3);
  for (const group of temRandomUnloadedGroups) {
    map[group.groupId] = group;
  }

  const towRandomLoadedGroups = shuffle(loadedGroups).slice(0, 2);
  for (const group of towRandomLoadedGroups) {
    map[group.groupId] = group;
  }

  for (const group of loadedGroups) {
    if (map[group.groupId]) {
      continue;
    }
    const latestContent = await Content.findOne({
      attributes: ['TimeStamp'],
      where: {
        TrxId: group.startTrx
      }
    });
    if (!latestContent) {
      continue;
    }
    const timestamp = parseInt(String(latestContent.TimeStamp / 1000000), 10);
    const hours = Math.abs(moment(timestamp).diff(new Date(), 'hours'));
    if (hours < 72) {
      map[group.groupId] = group;
    } else {
      DEBUG && console.log(`（大于 48 小时，跳过 ${group.groupId} ${group.groupName}）`);
    }
  }
  return map;
}

const getLimit = groups => {
  const unloadedCount = groups.filter(group => !group.loaded).length;
  DEBUG && console.log('活跃群组');
  DEBUG && console.log(groups.filter(group => !group.loaded).map(group => group.groupName))
  const configLimit = config.polling?.limit || 50;
  const limit = unloadedCount >= 2 ? Math.max(Math.round(configLimit/Math.pow(2, unloadedCount)), 10) : configLimit
  return limit;
}