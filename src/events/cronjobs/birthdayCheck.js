const { EmbedBuilder, resolveColor } = require("discord.js");
const schedule = require("node-schedule");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");

const init = async (client) => {
  schedule.scheduleJob({ hour: 00, minute: 00 }, function () {});

  // TEST
  schedule.scheduleJob("*/1 * * * *", async function () {});
};

async function birthdayCheck(client) {
  return new Promise(async (resolve) => {
    const allBotGuilds = await client.guilds.cache.map((guild) => guild);

    for (const guild of allBotGuilds) {
      const userData = await usersRepository.getBirthdayUsers(guild.id);

      let birthdaynames1 = "";
      let birthdaynames2 = "";
      let birthdaynames3 = "";
      let birthdaynames4 = "";

      if (userData) {
        for (const user of userData) {
          const member = await guild.members
            .fetch(user.userId)
            .catch((error) => {});

          const memberName = member?.displayName;

          var today = new Date();
          var birthDate = new Date(user.birthdate);
          var age = today.getFullYear() - birthDate.getFullYear();
          var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age = age - 1;
          }

          const birthText = `${memberName} (${age}) | `;

          if (birthdaynames1.length <= 1000) {
            birthdaynames1 += birthText;
          } else if (birthdaynames2.length <= 1000) {
            birthdaynames2 += birthText;
          } else if (birthdaynames3.length <= 1000) {
            birthdaynames3 += birthText;
          } else if (birthdaynames4.length <= 1000) {
            birthdaynames4 += birthText;
          }
        }
      }

      console.log(
        birthdaynames1.slice(0, -2),
        birthdaynames2.slice(0, -2),
        birthdaynames3.slice(0, -2),
        birthdaynames4.slice(0, -2)
      );

      const birthdayRoleId = await guildsRepository.getGuildSetting(
        guild,
        "birthdayRole"
      );

      const birthdayRole = await guild.roles
        .fetch(birthdayRoleId?.value)
        .catch((error) => {});

      if (!birthdayRole) {
        return resolve(null);
      } else {
      }
    }
  });
}

module.exports.init = init;
module.exports.generate = birthdayCheck;
