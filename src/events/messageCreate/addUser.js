const chalk = require("chalk");
const usersRepository = require("../../mysql/usersRepository");

module.exports = async function messageCreate(message) {
  return new Promise(async (resolve) => {
    const guildId = message.guildId;
    if (message.guildId == null) {
      return resolve(null);
    }

    await usersRepository.createUserTable(guildId);

    const getUser = await usersRepository.getUser(
      message.author.id,
      guildId
    );
    if (!getUser) {
      console.log(
        chalk.yellow(
          `[MYSQL DATABASE] UserId: ${message.author.id} bei Guild: ${guildId} nicht gefunden. User wird angelegt...`
        )
      );
      await usersRepository.addUser(guildId, message);
      console.log(
        chalk.blue(
          `[MYSQL DATABASE] User (${message.author.username}#${message.author.discriminator} | ID: ${message.author.id}) bei Guild: ${guildId} erfolgreich angelegt!`
        )
      );
    }

    return resolve(null);
  });
};