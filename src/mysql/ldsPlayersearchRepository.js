const mysqlHelper = require("./mysqlHelper");
const ldsPlayersearchCache = new Map();

const getldsPlayersearchEntry = async (guildId, messageId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_lds_spielersuche WHERE guildId = ? AND messageId = ? AND status = ?",
        [guildId, messageId, "active"],
        1
      )
      .then((result) => {
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getldsPlayersearchEntrybyChannel = async (guildId, channelId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_lds_spielersuche WHERE guildId = ? AND channelId = ? AND status = ?",
        [guildId, channelId, "active"],
        1
      )
      .then((result) => {
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const insertPlayersearchEntry = async (guildId, memberId, messageId, messageChannelId, modus, map, anmerkung, spielerzahl, channelId) => {
  return new Promise(async (resolve) => {

    if (!anmerkung) {
      anmerkung = "-"
    }

    mysqlHelper
      .query(
        "INSERT INTO powerbot_lds_spielersuche (guildId, memberId, messageId, messageChannelId, modus, map, anmerkung, spielerzahl, channelId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?)",
        [guildId, memberId, messageId, messageChannelId, modus, map, anmerkung, spielerzahl, channelId, "active"]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updatePlayersearchEntry = async (guildId, messageId) => {
  return new Promise(async (resolve) => {
    mysqlHelper
      .query(
        "UPDATE powerbot_lds_spielersuche SET status = ? WHERE guildId = ? AND messageId = ?",
        ["ended", guildId, messageId]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};


module.exports.getldsPlayersearchEntry = getldsPlayersearchEntry;
module.exports.getldsPlayersearchEntrybyChannel = getldsPlayersearchEntrybyChannel
module.exports.insertPlayersearchEntry = insertPlayersearchEntry;
module.exports.updatePlayersearchEntry = updatePlayersearchEntry;
