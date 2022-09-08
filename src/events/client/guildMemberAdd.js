const chalk = require("chalk");
const usersRepository = require("../../mysql/usersRepository");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    return new Promise(async (resolve) => {
      const guildId = member.guild.id;
      if (member.guild.id == null) {
        return resolve(null);
      }

      await usersRepository.createUserTable(guildId);

      const getUser = await usersRepository.getUser(member.user.id, guildId);
      if (!getUser) {
        console.log(
          chalk.yellow(
            `[MYSQL DATABASE] UserId: ${member.user.id} bei Guild: ${guildId} nicht gefunden. User wird angelegt...`
          )
        );
        await usersRepository.addUser(guildId, member.user);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] User (${member.user.username}#${member.user.discriminator} | ID: ${member.user.id}) bei Guild: ${guildId} erfolgreich angelegt!`
          )
        );
      }

      return resolve(null);
    });
  },
};
