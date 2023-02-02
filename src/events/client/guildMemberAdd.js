const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const welcomeBanner = require("../../functions/userManagement/welcomeBanner");
const loggingHandler = require("../../functions/fileLogging/loggingHandler");

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
        const logText = `[MYSQL DATABASE] UserId: ${member.user
          .id} bei Guild: ${guildId} nicht gefunden. User wird angelegt...`;
        loggingHandler.log(logText, "memberAdd");

        await usersRepository.addUser(guildId, member.user);
        const welcomeMessage = "Herzlich Willkommen";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        const logText2 = `[MYSQL DATABASE] User (${member.user
          .username}#${member.user.discriminator} | ID: ${member.user
          .id}) bei Guild: ${guildId} erfolgreich angelegt!`;
        loggingHandler.log(logText2, "memberAdd");

        // ########################## Give Community Role if exist ########################## \\
        const communityroleId = await guildsRepository.getGuildSetting(
          member.guild,
          "communityrole"
        );

        const communityrole = await member.guild.roles.cache.get(
          communityroleId
        );

        if (communityrole) {
          console.log(`Auto-Role | ${communityrole} bei ${member} hinzugefügt`);
          await member.roles.add(communityrole).catch(error);
        }

        // ########################## USER COUNT SPECIAL MESSAGE (EVERY 1000 MEMBERS) ########################## \\
        let nextUserCountSpecialValue = "";
        let insertOrUpdate = "";
        const newUser = await usersRepository.getUser(
          member.id,
          member.guild.id
        );

        const nextUserCountSpecial = await guildsRepository.getGuildSetting(
          member.guild,
          "nextUserCountSpecial"
        );

        if (!nextUserCountSpecial) {
          nextUserCountSpecialValue = 1000;
          insertOrUpdate = "insert";
        } else {
          nextUserCountSpecialValue = parseInt(nextUserCountSpecial.value);
        }

        const logText5 = `Guild: ${member.guild.name} (${member.guild
          .id}) | Next member achievement: ${newUser.ID}/${nextUserCountSpecialValue}`;
        loggingHandler.log(logText5, "memberAdd");

        if (newUser.ID == nextUserCountSpecialValue) {
          const UserCountSpecialEmbed = new EmbedBuilder()
            .setTitle(`⭐️ Wir sind ${nextUserCountSpecialValue} ⭐️`)
            .setDescription(
              `Unser ${nextUserCountSpecialValue}er Discord Member ist ${member} 🏆`
            )
            .setColor(0xffba0f)
            .setTimestamp(Date.now())
            .setImage("https://pwr.lol/img/memberAchievement.jpg")
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

          let nextUserCountSpecialValueNew = "";
          nextUserCountSpecialValueNew = nextUserCountSpecialValue + 1000;

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

          const logText6 = `Guild: ${member.guild.name} (${member.guild
            .id}) | RankUp --> Next member achievement: ${newUser.ID}/${nextUserCountSpecialValueNew}`;
          loggingHandler.log(logText6, "memberAdd");
        }
        // ###################################################################################################### \\
      } else {
        const welcomeMessage = "Willkommen zurück";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        const logText3 = `[MYSQL DATABASE] User (${member.user
          .username}#${member.user.discriminator} | ID: ${member.user
          .id}) ist bereits bei Guild: ${guildId} registriert!`;
        loggingHandler.log(logText3, "memberAdd");
      }
      return resolve(null);
    });
  }
};
