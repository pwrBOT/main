const schedule = require("node-schedule");
var client;

async function autoDeleteChannelCheck() {
    const autoDeleteChannelIds = ["1049671515836264499"];

    if (!autoDeleteChannelIds) {
        return;
      }

    autoDeleteChannelIds.forEach((autoDeleteChannelId) => {
        autoDeleteMessages(autoDeleteChannelId);
      });
}

async function autoDeleteMessages(autoDeleteChannelId) {
  return new Promise(async (resolve) => {
  
    let autoDeleteChannel = ``;

    try {
      autoDeleteChannel = await client.channels.fetch(autoDeleteChannelId);
    } catch (error) {}

  if (!autoDeleteChannel) {
    return resolve(null);
  }

  await autoDeleteChannel.bulkDelete(100, true)
  return resolve(null);
  })
}

async function init(_client) {
  client = _client;
  const cronJobTempBan = schedule.scheduleJob({hour: 23, minute: 00}, function() {
    console.log(`\x1b[32mCRONJOB | Auto-Delete-Channel ausgeführt\x1b[0m`);
    autoDeleteChannelCheck()
  });
}

module.exports.init = init;
