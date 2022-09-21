const mysqlHelper = require("./mysqlHelper");

const getlevelSettings = async (guild) => {
    return new Promise((resolve) => {
      mysqlHelper
        .query(
          "SELECT * FROM powerbot_levelsystem WHERE guildId = ?",
          [guild.id], 1
        )
        .then((result) => {
          resolve(result && result.length !== 0 ? result[0] : null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  };

  const addlevelSettings = async (guildId) => {
    return new Promise(async (resolve) => {
      mysqlHelper
        .query(
          "INSERT INTO powerbot_levelsystem (guildId) VALUES (?)", [
            guildId,
        ])
        .then((result) => {
          resolve(null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  };
  
  const updatelevelSettings = async (guild, column, newData) => {
    return new Promise(async (resolve) => {
      mysqlHelper
      .query(`UPDATE powerbot_levelsystem SET ${column}=? WHERE guildId = ?`, [
        newData,
        guild.id,
      ])
        .then((result) => {
          resolve(null);
        })
        .catch(() => {
          resolve(null);
        });
    });
  };

 module.exports.getlevelSettings = getlevelSettings;
 module.exports.addlevelSettings = addlevelSettings;
 module.exports.updatelevelSettings = updatelevelSettings;