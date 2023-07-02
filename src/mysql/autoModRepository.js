const mysqlHelper = require("./mysqlHelper");
const autoModRepoMap = new Map();

const getGuildAutoModSettings = async (guild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query("SELECT * FROM powerbot_automod WHERE guildId = ?", [guild.id], 1)
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updateAutoModSettingsDashboard = async (guild, column, newData) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`UPDATE powerbot_automod SET ${column}=? WHERE guildId = ?`, [
        newData,
        guild.id
      ])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addAutoModSettingsGuild = async (guildId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`INSERT INTO powerbot_automod (guildId) VALUES (?)`, [guildId])
      .then((result) => {
        resolve(null);
      })
      .catch((error) => {
        resolve(null);
      });
  });
};

module.exports.getGuildAutoModSettings = getGuildAutoModSettings;
module.exports.updateAutoModSettingsDashboard = updateAutoModSettingsDashboard;
module.exports.addAutoModSettingsGuild = addAutoModSettingsGuild;
