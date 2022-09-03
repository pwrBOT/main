const mysqlHelper = require("./mysqlHelper");

const getUser = async (memberId, guildId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM ${guildId}_users WHERE userId = ?`, [memberId], 1)
      .then((result) => {
        // GIBT DEN ERSTEN WERT DES ARRAYS ZURÜCK
        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getUsers = async (guild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM ${guild.id}_users`, [])
      .then((result) => {
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addUser = async (guildId, message) => {
  return new Promise((resolve) => {
    const userId = message.author.id;
    const userName = `${message.author.username}#${message.author.discriminator}`;
    const tabelle = `${guildId}_users`;

    mysqlHelper
      .query(`INSERT INTO ${tabelle} (userId, userName) VALUES ( ?, ?)`, [
        userId,
        userName,
      ])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addUserXP = async (guildId, message, newXP) => {
  return new Promise((resolve) => {
    const userId = message.author.id;
    const tabelle = `${guildId}_users`;

    mysqlHelper
      .query(`UPDATE ${tabelle} SET xP=? WHERE userId = ?`, [
        newXP,
        userId
      ])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getUserTable = async (guildId) => {
  return new Promise((resolve) => {
    const tabelle = `${guildId}_users`;
    mysqlHelper
      .query("SHOW TABLES FROM mbr_hosting_powerbot LIKE ?", [tabelle])
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const createUserTable = async (guildId) => {
  const tabelle = `${guildId}_users`;
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        `CREATE TABLE IF NOT EXISTS mbr_hosting_powerbot. ${tabelle} ( ID INT NOT NULL AUTO_INCREMENT , userId TEXT NOT NULL , userName TEXT NOT NULL , userAdd TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , xP BIGINT NOT NULL , Level INT NOT NULL , PRIMARY KEY (ID)) ENGINE = InnoDB`,
        [tabelle]
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

module.exports.getUser = getUser;
module.exports.getUsers = getUsers;
module.exports.addUser = addUser;
module.exports.addUserXP = addUserXP;
module.exports.getUserTable = getUserTable;
module.exports.createUserTable = createUserTable;
