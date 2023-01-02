const mysqlHelper = require("./mysqlHelper");

const getPowerbotManagementSettings = async (property) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "SELECT * FROM powerbot_management WHERE property = ?",
        [property])
        .then((result) => {
          // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
          resolve(result ?? null);
        })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.getPowerbotManagementSettings = getPowerbotManagementSettings;
