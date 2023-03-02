const mysqlHelper = require("./mysqlHelper");
const powerbotManagement = new Map();

const getValues = async (property) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query("SELECT * FROM powerbot_management WHERE property = ?", [property])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getValue = async (guild, property) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_management WHERE property = ? AND value = ?",
        [property, guild.id]
      )
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.getValues = getValues;
module.exports.getValue = getValue;
