const mysqlHelper = require("./mysqlHelper");

const getWarn = async (warnId, guildId, userId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_warns WHERE ID=? AND guildId=? AND userId=?', [warnId, guildId, userId])
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const getWarns = async (member, status, limit=-1) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_warns WHERE userId = ? AND guildId = ? AND warnStatus = ? ORDER BY ID', [member.user.id, member.guild.id, status], limit)
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const getObsoleteWarns = async () => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_warns WHERE warnStatus = ?', ["active"], -1)
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
      .query('INSERT INTO powerbot_warns (guildId, userId, warnReason, warnModName, warnModId, warnStatus) VALUES ( ?, ?, ?, ?, ?, ?)', [guildId, memberId, reason, warnModName, warnModId, "active"])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const delWarn = async (warnId, userId, delreason) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('UPDATE powerbot_warns SET warnStatus=?, delReason=? WHERE ID=? AND userId=?', ["removed", delreason, warnId, userId])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const delAllWarns = async (guildId, userId, delreason) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('UPDATE powerbot_warns SET warnStatus=?, delReason=? WHERE guildId=? AND userId=?', ["removed", delreason ,guildId, userId])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

module.exports.getWarn = getWarn;
module.exports.getWarns = getWarns;
module.exports.addWarn = addWarn;
module.exports.delWarn = delWarn;
module.exports.delAllWarns = delAllWarns;
module.exports.getObsoleteWarns = getObsoleteWarns