const mysqlHelper = require("./mysqlHelper");

const getTempBanUser = async (member) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_temp_commands WHERE memberId = ? AND guildId = ? AND tempType = ?",
        [member.user.id, member.guild.id, "tempban"],
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

const getTempMuteUser = async (member) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_temp_commands WHERE memberId = ? AND guildId = ? AND tempType = ?",
        [member.user.id, member.guild.id, "tempmute"],
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

const getAllTempBanUser = async (member) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM powerbot_temp_commands WHERE tempType = ? AND TIMEDIFF(tempEnd, NOW()) < 0`,["tempban"])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getAllTempMuteUser = async (member) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM powerbot_temp_commands WHERE tempType = ? AND TIMEDIFF(tempEnd, NOW()) < 0`,["tempmute"])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const deleteTempUser = async (unbanMember, unbanGuild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`DELETE FROM powerbot_temp_commands WHERE memberId = ? AND guildId = ?`,[unbanMember.id, unbanGuild.id])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addTempCommandUser = async (
  guildId,
  memberId,
  memberName,
  reason,
  warnModName,
  warnModId,
  tempType,
  tempEnd
) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "INSERT INTO powerbot_temp_commands (guildId, memberId, memberName, warnReason, warnModName, warnModId, tempType, tempEnd) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)",
        [guildId, memberId, memberName, reason, warnModName, warnModId, tempType, tempEnd]
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

module.exports.getTempBanUser = getTempBanUser;
module.exports.getTempMuteUser = getTempMuteUser;
module.exports.getAllTempBanUser = getAllTempBanUser;
module.exports.getAllTempMuteUser = getAllTempMuteUser;
module.exports.deleteTempUser = deleteTempUser;
module.exports.addTempCommandUser = addTempCommandUser;
