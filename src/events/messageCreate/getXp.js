const usersRepository = require("../../mysql/usersRepository");

module.exports = async function messageCreate(message) {
  return new Promise(async (resolve) => {
    const guildId = message.guildId;
    if (message.guildId == null) {
      return resolve(null);
    }

    const getUser = await usersRepository.getUser(message.author.id, guildId);

    if (!getUser) {
      return resolve(null);
    }
    if (message.author.bot == true) {
      return resolve(null);
    }
    let currentXP = getUser.xP;
    if (!currentXP) {
      currentXP = 0;
    }
    let XP = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
    var newXP = currentXP + XP;

    let newLevel = "";

    if (newXP < 100) {
      newLevel = 0;
    } else if (newXP < 1000) {
      newLevel = 1;
    } else if (newXP < 2000) {
      newLevel = 2;
    } else if (newXP < 4000) {
      newLevel = 3;
    } else if (newXP < 6000) {
      newLevel = 4;
    } else if (newXP < 10000) {
      newLevel = 5;
    } else if (newXP < 15000) {
      newLevel = 6;
    } else if (newXP < 20000) {
      newLevel = 7;
    } else if (newXP < 30000) {
      newLevel = 8;
    } else if (newXP < 50000) {
      newLevel = 9;
    } else {
      newLevel = 10;
    }

    await usersRepository.addUserXP(guildId, message, newXP, newLevel);
    return resolve(null);
  });
};
