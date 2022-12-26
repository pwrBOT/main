const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const welcomeBanner = require("../../functions/userManagement/welcomeBanner");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    return new Promise(async resolve => {
      const guildId = member.guild.id;
      if (member.guild.id == null) {
        return resolve(null);
      }

      await usersRepository.createUserTable(guildId);

      const getUser = await usersRepository.getUser(member.user.id, guildId);
      if (!getUser) {
        console.log(
          chalk.yellow(
            `[MYSQL DATABASE] UserId: ${member.user
              .id} bei Guild: ${guildId} nicht gefunden. User wird angelegt...`
          )
        );
        await usersRepository.addUser(guildId, member.user);
        const welcomeMessage = "Herzlich Willkommen";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        console.log(
          chalk.blue(
            `[MYSQL DATABASE] User (${member.user.username}#${member.user
              .discriminator} | ID: ${member.user
              .id}) bei Guild: ${guildId} erfolgreich angelegt!`
          )
        );
      } else {
        const welcomeMessage = "Willkommen zurück";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] User (${member.user.username}#${member.user
              .discriminator} | ID: ${member.user
              .id}) ist bereits bei Guild: ${guildId} registriert!`
          )
        );
      }

      // ########################## USER COUNT SPECIAL MESSAGE (EVERY 1000 MEMBERS) ########################## \\
      let nextUserCountSpecialValue = "";
      let insertOrUpdate = "";
      const newUser = await usersRepository.getUser(member.id, member.guild.id);
      const nextUserCountSpecial = await guildsRepository.getGuildSetting(
        member.guild,
        "nextUserCountSpecial"
      );

      if (!nextUserCountSpecial) {
        nextUserCountSpecialValue = 5;
        insertOrUpdate = "insert";
      } else {
        nextUserCountSpecialValue = parseInt(nextUserCountSpecial.value);
      }

      if (newUser.ID == nextUserCountSpecialValue) {
        const UserCountSpecialEmbed = new EmbedBuilder()
          .setTitle(`⭐️ Wir sind ${nextUserCountSpecialValue} ⭐️`)
          .setDescription(`Unser ${nextUserCountSpecialValue}er Discord Member ist ${member} 🏆`)
          .setColor(0xFFBA0F)
          .setTimestamp(Date.now())
          .setImage('https://pwr.lol/img/memberAchievement.jpg')
          .setFooter({
            iconURL: member.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          });

        const achievementChannel = await guildsRepository.getGuildSetting(
          member.guild,
          "achievementChannel"
        );

        if (achievementChannel) {
          if (achievementChannel.value) {
            await member.client.channels.cache
              .get(achievementChannel.value)
              .send({ embeds: [UserCountSpecialEmbed] })
              .catch(console.error);
          }
        }
      }

      let nextUserCountSpecialValueNew = "";
      nextUserCountSpecialValueNew = nextUserCountSpecialValue + 1000;

      console.log(
        `Guild: ${member.guild
          .name} | Next member achievement: ${nextUserCountSpecialValueNew}`
      );

      if (insertOrUpdate == "insert") {
        await guildsRepository.insertGuildSetting(
          member.guild,
          "nextUserCountSpecial",
          nextUserCountSpecialValueNew.toString()
        );
      } else {
        await guildsRepository.updateGuildSetting(
          member.guild,
          "nextUserCountSpecial",
          nextUserCountSpecialValueNew.toString()
        );
      }
      // ###################################################################################################### \\
    });
  }
};
