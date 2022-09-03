const mysqlHelper = require("./mysqlHelper");

const cache = new Map();

const getGuildSettings = async (guild) => {
  return new Promise((resolve) => {
    if (cache.has(guild.id)) {
      return resolve(cache.get(guild.id));
    }

    mysqlHelper
      .query("SELECT * FROM powerbot_guilds WHERE guildId = ?", [guild.id], 1)
      .then((result) => {
        if (result && result.length !== 0) {
          cache.set(guild.id, result[0]);
        }

        resolve(result && result.length !== 0 ? result[0] : null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

// after update settings use cache.delete(guild.id);

const getAllGuildSettings = async (guild) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query("SELECT modLog FROM powerbot_guilds")
      .then((result) => {
        // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
        resolve(result ?? null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const addGuild = async (
  guildId,
  guildName,
  botLog,
  modLog,
  botMaster,
  teamRole,
  modRole,
  welcomechannel,
  language
) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "INSERT INTO powerbot_guilds (guildId, guildName, botLog, modLog, botMaster, teamRole, modRole, welcomechannel, language) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          guildId,
          guildName,
          botLog.id,
          modLog.id,
          botMaster.id,
          teamRole.id,
          modRole.id,
          welcomechannel.id,
          language,
        ]
      )
      .then((result) => {
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] Guild Settings für ${guildName}(${guildId}) erfolgreich gespeichert!`
          )
        );
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updateGuild = async (
  guildId,
  guildName,
  botLog,
  modLog,
  botMaster,
  teamRole,
  modRole,
  welcomechannel,
  language
) => {
  return new Promise((resolve) => {
    mysqlHelper
      .query(
        "UPDATE powerbot_guilds SET guildId=?, guildName=?, botLog=?, modLog=?, botMaster=?, teamRole=?, modRole=?, welcomechannel=?, language=? WHERE guildId = ?",
        [
          guildId,
          guildName,
          botLog.id,
          modLog.id,
          botMaster.id,
          teamRole.id,
          modRole.id,
          welcomechannel.id,
          language,
          guildId,
        ],
        1
      )
      .then((result) => {
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] Guild Settings für ${guildName}(${guildId}) erfolgreich gespeichert!`
          )
        );
        resolve(null);
      })
      .catch(() => {
        resolve(null);
      });
  });
};

const updateChannel = async (guild, column, newData) => {
  return new Promise((resolve) => {
    cache.delete(guild.id)
    mysqlHelper
      .query(`UPDATE powerbot_guilds SET ${column}=? WHERE guildId = ?`, [
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

module.exports.getGuildSettings = getGuildSettings;
module.exports.getAllGuildSettings = getAllGuildSettings;
module.exports.addGuild = addGuild;
module.exports.updateGuild = updateGuild;
module.exports.updateChannel = updateChannel;
