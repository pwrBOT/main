const mysqlHelper = require("./mysqlHelper");
const moment = require("moment");

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

const addUser = async (guildId, message, userAdd) => {
  return new Promise((resolve) => {
    const userId = message.id;
    const userName = `${message.username}#${message.discriminator}`;
    const tabelle = `${guildId}_users`;
    let userAddDate = "";
    if (!userAdd) {
      userAddDate = new Date(Date.now());
    } else {
      userAddDate = new Date(userAdd);
    }

    mysqlHelper
      .query(
        `INSERT INTO ${tabelle} (userId, userName, userAdd) VALUES ( ?, ?, ?)`,
        [userId, userName, userAddDate]
      )
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addUserXP = async (guildId, user, newXP) => {
  return new Promise((resolve) => {
    const userId = user.id;
    const tabelle = `${guildId}_users`;

    mysqlHelper
      .query(`UPDATE ${tabelle} SET xP=? WHERE userId = ?`, [newXP, userId])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addUserLevel = async (guildId, user, newLevel) => {
  return new Promise((resolve) => {
    const userId = user.id;
    const tabelle = `${guildId}_users`;

    mysqlHelper
      .query(`UPDATE ${tabelle} SET Level=? WHERE userId = ?`, [newLevel, userId])
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
        `CREATE TABLE IF NOT EXISTS mbr_hosting_powerbot. ${tabelle} ( ID INT NOT NULL AUTO_INCREMENT , userId TEXT NOT NULL , userName TEXT NOT NULL , userAdd DATETIME NOT NULL , xP BIGINT NOT NULL , Level INT NOT NULL , PRIMARY KEY (ID)) ENGINE = InnoDB`,
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

const importUserXp = async (xpImport, username) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`UPDATE 396282694906150913_users SET xP=? WHERE userName LIKE ?`, [
        xpImport,
        username,
      ])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const giveUserXP = async (guildId, userId, newXP, newLevel) => {
  return new Promise((resolve) => {
    const tabelle = `${guildId}_users`;

    mysqlHelper
      .query(`UPDATE ${tabelle} SET xP=?, Level=? WHERE userId = ?`, [newXP, newLevel, userId])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.getUser = getUser;
module.exports.addUser = addUser;
module.exports.addUserXP = addUserXP;
module.exports.addUserLevel = addUserLevel;
module.exports.getUserTable = getUserTable;
module.exports.createUserTable = createUserTable;
module.exports.importUserXp = importUserXp;
module.exports.giveUserXP = giveUserXP;
