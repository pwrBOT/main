const mysqlHelper = require("./mysqlHelper");

const addReport = async (interaction, reporterId, memberId, reason, status, modId, reportId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        `INSERT INTO powerbot_reports (guildId, reporterId, reportedMemberId, reportReason, reportStatus, modId, reportId) VALUES ( ?, ?, ?, ?, ?, ?, ?)`,
        [interaction.guild.id, reporterId, memberId, reason, status, modId, reportId]
      )
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updateReport = async (guildId, reportId, status, modId) => {
    return new Promise(async (resolve) => {
      mysqlHelper
        .query(
          `UPDATE powerbot_reports SET reportStatus=?, modId=? WHERE guildId=? AND reportId LIKE "%"? ORDER BY ID DESC`,
          [status, modId, guildId, reportId]
        )
        .then((result) => {
          // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  };

const getReport = async (guildId, reportId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        `SELECT * FROM powerbot_reports WHERE guildId=? AND reportId LIKE "%"? ORDER BY ID DESC`,
        [guildId, reportId],
        1
      )
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getReports = async (guildId, reportedMemberId, limit) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        `SELECT * FROM powerbot_reports WHERE guildId=? AND reportedMemberId=? ORDER BY ID`,
        [guildId, reportedMemberId],
        limit)
      .then( (result) => {
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getAllUserReports = async (guildId, reportedMemberId, limit=-1) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        `SELECT * FROM powerbot_reports WHERE guildId=? AND reportedMemberId=? AND reportStatus LIKE "%Resolved%"`,
        [guildId, reportedMemberId],
        limit)
      .then( (result) => {
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.addReport = addReport;
module.exports.updateReport = updateReport;
module.exports.getReport = getReport;
module.exports.getReports = getReports;
module.exports.getAllUserReports = getAllUserReports;