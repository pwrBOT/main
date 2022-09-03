const mysqlHelper = require("./mysqlHelper");

const getWarns = async (member, limit=-1) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_warns WHERE userId = ? AND guildId = ? ORDER BY ID', [member.user.id, member.guild.id], limit)
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const addWarn = async (guildId, memberId, reason, warnModName, warnModId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('INSERT INTO powerbot_warns (guildId, userId, warnReason, warnModName, warnModId) VALUES ( ?, ?, ?, ?, ?)', [guildId, memberId, reason, warnModName, warnModId])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

module.exports.getWarns = getWarns;
module.exports.addWarn = addWarn;