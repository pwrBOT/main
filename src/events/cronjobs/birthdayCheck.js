const { EmbedBuilder, resolveColor } = require("discord.js");
const schedule = require("node-schedule");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");

const init = async (client) => {
  schedule.scheduleJob({ hour: 00, minute: 00 }, function () {});

  // TEST
  schedule.scheduleJob("*/1 * * * *", async function () {
  });
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
        // FOR SCHLEIFE!
        const user = await client.users
          .fetch(userData.userId)
          .catch((error) => {});

          console.log(`${userData.userName}`)

        if (birthdaynames1.length <= 1000) {
          birthdaynames1 += `${userData.userName}\n`;
        } else if (birthdaynames2.length <= 1000) {
          birthdaynames2 += `${userData.userName}\n`;
        } else if (birthdaynames3.length <= 1000) {
          birthdaynames3 += `${userData.userName}\n`;
        } else if (birthdaynames4.length <= 1000) {
          birthdaynames4 += `${userData.userName}\n`;
        }
      }

      console.log(birthdaynames1);
      console.log(birthdaynames2);
      console.log(birthdaynames3);
      console.log(birthdaynames4);

      const birthdayRoleId = await guildsRepository.getGuildSetting(
        guild,
        "birthdayRole"
      );

      const birthdayRole = await guild.roles
        .fetch(birthdayRoleId?.value)
        .catch((error) => {});

      if (!birthdayRole) {
        return resolve(null);
      }
    }
  });
}

module.exports.init = init;
