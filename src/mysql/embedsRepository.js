const mysqlHelper = require("./mysqlHelper");

const getEmbed = async (guild, type) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_embeds WHERE guildId = ? AND type = ?",
        [guild.id, type],
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

const updateEmbed = async (column, newData, guild, type) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        `UPDATE powerbot_embeds SET ${column}=? WHERE guildId = ? AND type = ?`,
        [newData, guild.id, type]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addEmbed = async (guild, type, active, dm, messageContent, content, embed) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "INSERT INTO powerbot_embeds (guildId, type, active, dm, messageContent, content, embed) VALUES ( ?, ?, ?, ?, ?, ?, ?)",
        [guild.id, type, active, dm, messageContent, content, embed]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.getEmbed = getEmbed;
module.exports.updateEmbed = updateEmbed;
module.exports.addEmbed = addEmbed;
