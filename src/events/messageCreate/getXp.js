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

    await usersRepository.addUserXP(guildId, message, newXP);
    return resolve(null);
  });
};
