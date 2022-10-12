const fs = require('fs');
const path = require('path');
const sleep = require('./utils/sleep');
const Group = require('./database/sequelize/group');
// const Seed = require('./database/sequelize/seed');
const Content = require('./database/sequelize/content');
const Post = require('./database/sequelize/post');
const Comment = require('./database/sequelize/comment');
const Profile = require('./database/sequelize/profile');
const Counter = require('./database/sequelize/counter');
const UniqueCounter = require('./database/sequelize/uniqueCounter');
const Notification = require('./database/sequelize/notification');

(async () => {
  await sleep(5000);
  try {
    // await Group.sync({ force: true });
    // await Seed.sync({ force: true });
    await Group.update({
      startTrx: '',
      loaded: false,
      contentCount: 0
    }, {
      where: {
        loaded: true
      }
    });
    await Content.sync({ force: true });
    await Post.sync({ force: true });
    await Comment.sync({ force: true });
    await Profile.sync({ force: true });
    await Counter.sync({ force: true });
    await UniqueCounter.sync({ force: true });
    await Notification.sync({ force: true });
  } catch (err) {
    console.log(err);
  }
  console.log("Reset all database tables ✅ ");
  const localStoragePath = path.join(__dirname, 'localStorage');
  fs.rmSync(localStoragePath, { recursive: true, force: true });
  console.log('Removed localStorage ✅ ');
})();