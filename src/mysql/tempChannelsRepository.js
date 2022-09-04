const mysqlHelper = require("./mysqlHelper");

const getAllTempVoiceChannel = async (guildId) => {
    return new Promise((resolve) => {
        mysqlHelper
            .query(`SELECT * FROM powerbot_temp_channels WHERE guildId = ?`, [guildId])
            .then((result) => {
                // GIBT DEN ALLE WERTE DES ARRAYS ZURÜCK
                resolve(result ?? null);
            })
            .catch(() => {
                resolve(null);
            });
    });
};

const getTempVoiceChannel = async (guildId, guildChannelId) => {
    return new Promise((resolve) => {
        mysqlHelper
            .query(`SELECT * FROM powerbot_temp_channels WHERE guildId = ? AND guildChannelId = ?`, [guildId, guildChannelId], 1)
            .then((result) => {
                resolve(result && result.length !== 0 ? result[0] : null);
            })
            .catch(() => {
                resolve(null);
            });
    });
};

const addTempVoiceChannel = async (
    guildId,
    guildChannelId,
    master,
    giveUserPermission
) => {
    return new Promise((resolve) => {
        mysqlHelper
            .query(
                "INSERT INTO powerbot_temp_channels (guildId, guildChannelId, type, giveUserPermission) VALUES (?, ?, ?, ?)",
                [guildId, guildChannelId, master, giveUserPermission]
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

module.exports.getAllTempVoiceChannel = getAllTempVoiceChannel;
module.exports.getTempVoiceChannel = getTempVoiceChannel;
module.exports.addTempVoiceChannel = addTempVoiceChannel;