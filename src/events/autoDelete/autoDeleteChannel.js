var client;

async function userTempBanCheck() {
    const autoDeleteChannelIds = ["1049671515836264499"];

    if (!autoDeleteChannelIds) {
        return;
      }

    autoDeleteChannelIds.forEach((autoDeleteChannelId) => {
        autoDeleteMessages(autoDeleteChannelId);
      });
}

async function autoDeleteMessages(autoDeleteChannelId) {
  const autoDeleteChannel = await client.channels.fetch(autoDeleteChannelId);

  await autoDeleteChannel.bulkDelete(100, true)
}

async function init(_client) {
  client = _client;
  setInterval(userTempBanCheck, 86400000);
}

module.exports.init = init;
