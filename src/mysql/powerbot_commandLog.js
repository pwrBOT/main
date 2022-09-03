const mysqlHelper = require("./mysqlHelper");

const logCommandUse = async (guild, command, user, affectedMember, reason) => {
  return new Promise((resolve) => {
    const guildId = guild.id;
    var affectedId = "";
    var affectedName = "";
    if (affectedMember == "-") {
      affectedId = "-";
      affectedName = "-";
    } else {
      affectedId = `${affectedMember.id}`
      affectedName = `${affectedMember.username}#${affectedMember.discriminator}`;
    }
    const userId = user.id;
    const userName = `${user.username}#${user.discriminator}`;

    mysqlHelper
      .query(
        `INSERT INTO powerbot_log (guildId, command, userName, userId, affectedName, affectedId, reason) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [guildId, command, userName, userId, affectedName, affectedId, reason]
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

module.exports.logCommandUse = logCommandUse;
