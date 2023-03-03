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

      if (userData) {
        const user = await client.users.fetch(userData.userId);

        const today = new Date();
        const birthdate = new Date(userData.birthdate);

        if (
          today.getMonth() == birthdate.getMonth() &&
          today.getDay() == birthdate.getDay()
        ) {
          console.log(`${user} hat heute Geburtstag`);
        }

        const birthdayRoleId = await guildsRepository.getGuildSetting(
          guild,
          "birthdayRole"
        );
        if (birthdayRoleId?.value?.length == 0) {
          console.log(`Keine Birthdayrole bei ${guild.name}`);
          return resolve(null);
        }

        const birthdayRole = await guild.roles.fetch(birthdayRoleId.value);

        if (!birthdayRole) {
          return resolve(null);
        }
      }
    }
  });
}

module.exports.init = init;
