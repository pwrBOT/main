const mysqlHelper = require("./mysqlHelper");

const getGuild = async (guild, limit=-1) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_guilds WHERE guildId = ?', [guild.id])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const addGuild = async (guild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('INSERT INTO powerbot_guilds (guildId, guildName) VALUES (?, ?)', [guild.id, guild.name])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

module.exports.getGuild = getGuild;
module.exports.addGuild = addGuild;