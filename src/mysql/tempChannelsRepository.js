const mysqlHelper = require("./mysqlHelper");
const cache = new Map();

const getAllTempVoiceChannel = async (guildId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM powerbot_temp_channels WHERE guildId = ?`, [
        guildId,
      ])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getTempVoiceChannel = async (guildId, guildChannelId, type) => {
  return new Promise((resolve) => {
    if (cache.has(guildId)) {
      console.log("Temp-Channel Cache wurde benutzt");
      return resolve(cache.get(guildId));
    }

    mysqlHelper
      .query(
        `SELECT * FROM powerbot_temp_channels WHERE guildId = ? AND guildChannelId = ? AND type = ?`,
        [guildId, guildChannelId, type],
        1
      )
      .then((result) => {
        if (result && result.length !== 0) {
          cache.set(guildId, result[0]);
          console.log("Temp-Channel Cache wurde geupdated");
        }

        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addTempVoiceChannel = async (
  guildId,
  guildChannelId,
  type,
  tempChannelName,
  tempChannelOwner,
  giveUserPermission
) => {
  return new Promise((resolve) => {
    cache.delete(guildId);
    console.log("Temp-Channel Cache wurde gecleared");
    mysqlHelper
      .query(
        "INSERT INTO powerbot_temp_channels (guildId, guildChannelId, type, tempChannelName, tempChannelOwner, giveUserPermission) VALUES (?, ?, ?, ?, ?, ?)",
        [
          guildId,
          guildChannelId,
          type,
          tempChannelName,
          tempChannelOwner,
          giveUserPermission,
        ]
      )
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const deleteTempVoiceChannel = async (guildId, guildChannelId, type) => {
  return new Promise((resolve) => {
    cache.delete(guildId);
    console.log("Temp-Channel Cache wurde gecleared");
    mysqlHelper
      .query(
        `DELETE FROM powerbot_temp_channels WHERE guildId = ? AND guildChannelId = ? AND type = ?`,
        [guildId, guildChannelId, type]
      )
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.getAllTempVoiceChannel = getAllTempVoiceChannel;
module.exports.getTempVoiceChannel = getTempVoiceChannel;
module.exports.addTempVoiceChannel = addTempVoiceChannel;
module.exports.deleteTempVoiceChannel = deleteTempVoiceChannel;
