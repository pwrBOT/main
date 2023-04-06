const mysqlHelper = require("./mysqlHelper");

const add = async (guildId, monitoringChannelId, pingRoleId, name, link) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "INSERT INTO powerbot_monitoring (guildId, monitoringChannelId, pingRoleId, name, link, status) VALUES ( ?, ?, ?, ?, ?, ?)",
        [guildId, monitoringChannelId, pingRoleId, name, link, "-"]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const update = async (guildId, link, status) => {
  return new Promise(async (resolve) => {
    mysqlHelper
      .query(
        `UPDATE powerbot_monitoring SET status=? WHERE guildId=? AND link=?`,
        [status, guildId, link]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const lastCheck = async (guildId, link) => {
  return new Promise(async (resolve) => {
    mysqlHelper
      .query(
        `UPDATE powerbot_monitoring SET lastCheck=? WHERE guildId=? AND link=?`,
        [new Date(), guildId, link]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const get = async (guildId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM powerbot_monitoring WHERE guildId=? ORDER BY ID ASC`,[guildId])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getAll = async () => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM powerbot_monitoring`)
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.add = add;
module.exports.lastCheck = lastCheck;
module.exports.update = update;
module.exports.get = get;
module.exports.getAll = getAll;
