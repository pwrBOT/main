const mysqlHelper = require("./mysqlHelper");


const getLogsByType = async (member, type, limit) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_userlog WHERE guildId = ? AND userId = ? AND type = ? ORDER BY ID DESC', [member.guild.id, member.user.id, type], limit)
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const getLogsByAction = async (member, action, limit) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query('SELECT * FROM powerbot_userlog WHERE guildId = ? AND userId = ? AND type = ? ORDER BY ID DESC', [member.guild.id, member.user.id, action], limit)
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

const addLog = async (guildId_, userId_, action_, type_, oldState_, newState_) => {
  return new Promise((resolve) => {

    const guildId = guildId_ ?? "-"
    const userId = userId_ ?? "-"
    const action = action_ ?? "-"
    const type = type_ ?? "-"
    const oldState = oldState_ ?? "-"
    const newState = newState_ ?? "-"

    mysqlHelper
      .query('INSERT INTO powerbot_userlog (guildId, userId, action, type, oldState, newState) VALUES ( ?, ?, ?, ?, ?, ?)', [guildId, userId, action, type, oldState, newState])
      .then( (result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}




module.exports.getLogsByType = getLogsByType;
module.exports.addLog = addLog;