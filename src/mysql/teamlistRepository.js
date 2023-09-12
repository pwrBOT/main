const mysqlHelper = require("./mysqlHelper");

const getTeamlistSettings = async (guild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_teamliste WHERE guildId = ?",
        [guild?.id],
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

const addTeamlistSettings = async (
  guildId,
  status,
  teamlistChannelId,
  messageId,
  teamroleId1,
  teamroleId2,
  teamroleId3,
  teamroleId4,
  teamroleId5
) => {
  return new Promise(async (resolve) => {
    let teamRoleId4 = "";
    let teamRoleId5 = "";

    if (!teamroleId4) {
      teamRoleId4 = "-";
    } else {
      teamRoleId4 = teamroleId4;
    }

    if (!teamroleId5) {
      teamRoleId5 = "-";
    } else {
      teamRoleId5 = teamroleId5;
    }

    mysqlHelper
      .query(
        "INSERT INTO powerbot_teamliste (guildId, status, teamlistChannelId, messageId, teamroleId1, teamroleId2, teamroleId3, teamroleId4, teamroleId5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          guildId,
          status,
          teamlistChannelId,
          messageId,
          teamroleId1,
          teamroleId2,
          teamroleId3,
          teamRoleId4,
          teamRoleId5
        ]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const changeTeamlistStatus = async (guild, newData) => {
  return new Promise(async (resolve) => {
    mysqlHelper
      .query(`UPDATE powerbot_teamliste SET status=? WHERE guildId = ?`, [
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

const deleteTeamlistSettings = async (guild) => {
  return new Promise(async (resolve) => {
    mysqlHelper
      .query(`DELETE from powerbot_teamliste WHERE guildId = ?`, [guild.id])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updateTeamlistSettings = async (guild, property, value) => {
  return new Promise(async (resolve) => {
    mysqlHelper
      .query(
        `UPDATE powerbot_teamliste SET ${property}=? WHERE guildId=?`,
        [value, guild.id]
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

module.exports.getTeamlistSettings = getTeamlistSettings;
module.exports.addTeamlistSettings = addTeamlistSettings;
module.exports.changeTeamlistStatus = changeTeamlistStatus;
module.exports.deleteTeamlistSettings = deleteTeamlistSettings;
module.exports.updateTeamlistSettings = updateTeamlistSettings;
