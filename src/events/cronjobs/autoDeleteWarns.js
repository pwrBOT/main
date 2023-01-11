const { EmbedBuilder } = require("discord.js");
const warnsRepository = require("../../mysql/warnsRepository");
const schedule = require("node-schedule");
var client;

async function init(_client) {
  client = _client;
  const cronJobWarnRepository = schedule.scheduleJob(
    { hour: 23, minute: 00 },
    function() {
      console.log(`\x1b[32mCRONJOB | Warn Remove Check ausgeführt\x1b[0m`);
      warnCheck();
    }
  );
}

async function warnCheck() {
  const allObsoleteWarns = await warnsRepository.getObsoleteWarns();

  if (!allObsoleteWarns) {
    return;
  }

  let expiredWarnIds = "-";

  allObsoleteWarns.forEach(async warn => {
    currentDate = new Date();
    var timeDifference = currentDate.getTime() - warn.warnAdd.getTime();
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const warnId = warn.ID;
    const userId = warn.userId;

    if (dayDifference >= 91) {
      expiredWarnIds += `${warnId} / `
      await warnsRepository.delWarn(warnId, userId, "Expired (>90 days)");
    }
  });
  console.log(`\x1b[32mExpired Warn IDs: ${expiredWarnIds}\x1b[0m`)
}

module.exports.init = init;
