const mysqlHelper = require("./mysqlHelper");

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

const updateUser = async (guildId, userId, column, value) => {
  return new Promise(async (resolve) => {
    const tabelle = `${guildId}_users`;

    mysqlHelper
      .query(`UPDATE ${tabelle} SET ${column}=? WHERE userId = ?`, [
        value,
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

const getUsers = async (guildId) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(`SELECT * FROM ${guildId}_users`)
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const getBirthdayUsers = async (guildId) => {
  return new Promise((resolve) => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;

    mysqlHelper
      .query(
        `SELECT * FROM ${guildId}_users WHERE DAY(birthdate) = ? AND MONTH(birthdate) = ? AND birthdate >= DATE_SUB(SYSDATE(), INTERVAL 100 YEAR)`,
        [todayDay, todayMonth]
      )
      .then((result) => {
        resolve(result ?? null);
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
        `CREATE TABLE IF NOT EXISTS mbr_hosting_powerbot. ${tabelle} ( ID INT NOT NULL AUTO_INCREMENT , userId TEXT NOT NULL , userName TEXT NOT NULL , userAdd DATETIME NOT NULL , lastChannelJoin TEXT NOT NULL , totalVoiceTime BIGINT DEFAULT 0 NOT NULL , xP BIGINT DEFAULT 0 NOT NULL , Level INT DEFAULT 0 NOT NULL , messageCount TEXT DEFAULT 0 NOT NULL , birthdate DATE NOT NULL, PRIMARY KEY (ID)) ENGINE = InnoDB`,
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
        username
      ])
      .then((result) => {
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

module.exports.addUser = addUser;
module.exports.updateUser = updateUser;
module.exports.getUser = getUser;
module.exports.getUsers = getUsers;
module.exports.getUserTable = getUserTable;
module.exports.getBirthdayUsers = getBirthdayUsers;
module.exports.createUserTable = createUserTable;
module.exports.importUserXp = importUserXp;
