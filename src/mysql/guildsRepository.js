const mysqlHelper = require("./mysqlHelper");
const guildCache = new Map();

const getGuildSetting = async (guild, property) => {
  return new Promise((resolve) => {
          mysqlHelper
        .query(
          "SELECT * FROM powerbot_guildsettings WHERE guildId = ? AND property = ?",
          [guild.id, property],
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

const getGuildSettings = async (guild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query("SELECT * FROM powerbot_guildsettings WHERE guildId = ?", [
        guild.id
      ])
      .then((result) => {
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getGuildSettingsByProperty = async (property) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query("SELECT * FROM powerbot_guildsettings WHERE property = ?", [
        property
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

const insertGuildSetting = async (guild, property, value) => {
  return new Promise(async (resolve) => {
    if (!value) {
      value = "";
    }

    mysqlHelper
      .query(
        "INSERT INTO powerbot_guildsettings (guildId, property, value) VALUES (?, ?, ?)",
        [guild.id, property, value]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updateGuildSetting = async (guild, property, value) => {
  return new Promise(async (resolve) => {
    if (!value) {
      value = "";
    }

    mysqlHelper
      .query(
        "UPDATE powerbot_guildsettings SET value=? WHERE guildId = ? AND property = ?",
        [value, guild.id, property]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.getGuildSetting = getGuildSetting;
module.exports.getGuildSettings = getGuildSettings;
module.exports.insertGuildSetting = insertGuildSetting;
module.exports.updateGuildSetting = updateGuildSetting;
module.exports.getGuildSettingsByProperty = getGuildSettingsByProperty;
