const mysqlHelper = require("./mysqlHelper");

const getEntry = async (guildId, userId, status) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_conspicuousUser WHERE guildId=? AND userId=? AND status=?', [guildId, userId, status])
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const getSpecificEntry = async (guildId, userId, value) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_conspicuousUser WHERE guildId=? AND userId=? AND reason=?', [guildId, userId, value])
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const getEntries = async (member, status, limit=-1) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_conspicuousUser WHERE userId = ? AND guildId = ? AND status = ? ORDER BY ID', [member.user.id, member.guild.id, status], limit)
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const addEntry = async (guildId, memberId, reason, modName, modId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('INSERT INTO powerbot_conspicuousUser (guildId, userId, reason, modName, modId, status) VALUES ( ?, ?, ?, ?, ?, ?)', [guildId, memberId, reason, modName, modId, "active"])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const delEntry = async (entryId, userId, delreason) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('UPDATE powerbot_conspicuousUser SET status=?, delReason=? WHERE ID=? AND userId=?', ["removed", delreason, entryId, userId])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}


module.exports.getEntry = getEntry;
module.exports.getSpecificEntry = getSpecificEntry;
module.exports.getEntries = getEntries;
module.exports.addEntry = addEntry;
module.exports.delEntry = delEntry;