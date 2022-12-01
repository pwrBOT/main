const chalk = require("chalk");
const usersRepository = require("../../mysql/usersRepository");
const welcomeBanner = require("../../functions/userManagement/welcomeBanner");

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

        const user = await usersRepository.getUser(member.id, member.guild.id);
        const welcomeMessage = "Herzlich Willkommen"
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        console.log(
          chalk.blue(
            `[MYSQL DATABASE] User (${member.user.username}#${member.user.discriminator} | ID: ${member.user.id}) bei Guild: ${guildId} erfolgreich angelegt!`
          )
        );
      } else {
        const user = await usersRepository.getUser(member.id, member.guild.id);
        const welcomeMessage = "Willkommen zurück"
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] User (${member.user.username}#${member.user.discriminator} | ID: ${member.user.id}) ist bereits bei Guild: ${guildId} registriert!`
          )
        );
      }

      return resolve(null);
    });
  }
};
