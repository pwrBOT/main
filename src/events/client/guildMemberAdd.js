const { EmbedBuilder } = require("discord.js");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const welcomeBanner = require("../../functions/userManagement/welcomeBanner");
const loggingHandler = require("../../functions/fileLogging/loggingHandler");
const embedsRepository = require("../../mysql/embedsRepository");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    return new Promise(async (resolve) => {
      if (!member) {
        return resolve(null);
      }

      if (!member.guild) {
        return resolve(null);
      }

      if (member.user.bot === true) {
        console.log(
          `Bot (${member.displayName}) bei ${member.guild.name} gejoined.`
        );
        return resolve(null);
      }

      await usersRepository.createUserTable(member.guild.id);

      const getUser = await usersRepository.getUser(
        member.user.id,
        member.guild.id
      );

      if (!getUser) {
        const logText = `[MYSQL DATABASE] UserId: ${member.user.id} bei Guild: ${member.guild.id} nicht gefunden. User wird angelegt...`;
        loggingHandler.log(logText, "memberAdd");

        await usersRepository.addUser(member.guild.id, member.user);
        const welcomeMessage = "Herzlich Willkommen";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        const logText2 = `[MYSQL DATABASE] User (${member.user.username}#${member.user.discriminator} | ID: ${member.user.id}) bei Guild: ${member.guild.id} erfolgreich angelegt!`;
        loggingHandler.log(logText2, "memberAdd");

        await addCommunityRole(member);
        await sendWelcomeMessage(member);
        await userCountSpecial(member);

        return resolve(null);
        // ###################################################################################################### \\
      } else {
        const welcomeMessage = "Willkommen zurück";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        const logText3 = `[MYSQL DATABASE] User (${member.user.username}#${member.user.discriminator} | ID: ${member.user.id}) ist bereits bei Guild: ${member.guild.id} registriert!`;
        loggingHandler.log(logText3, "memberAdd");

        await addCommunityRole(member);
        await sendWelcomeMessage(member);

        return resolve(null);
      }
    });
  }
};

const sendWelcomeMessage = async (member) => {
  setTimeout(async function () {
    const welcomeEmbedData = await embedsRepository.getEmbed(
      member.guild,
      "welcomeMessage"
    );

    if (welcomeEmbedData) {
      if (welcomeEmbedData.dm == 1) {
        if (welcomeEmbedData.messageContent) {
          const welcomeMessageData = await JSON.parse(
            welcomeEmbedData.messageContent
          );

          const welcomeEmbed = new EmbedBuilder(welcomeMessageData.embed);
          let welcomeContent = "";

          try {
            if (welcomeMessageData.content) {
              welcomeContent = welcomeMessageData.content;
            }
          } catch (error) {}

          welcomeEmbed
            .setThumbnail(member.guild.iconURL())
            .setTimestamp(Date.now());

          try {
            member
              .send({
                embeds: [welcomeEmbed],
                content: welcomeContent
              })
              .catch((error) => {});
          } catch (error) {}
        }
      }
    }
  }, 5000);
};

const addCommunityRole = async (member) => {
  setTimeout(async function () {
    const communityroleIds = await guildsRepository.getGuildSetting(
      member.guild,
      "communityrole"
    );

    if (communityroleIds) {
      if (communityroleIds?.value != `[""]`) {
        const communityRoleIdsValue = JSON.parse(communityroleIds.value);
        communityRoleIdsValue.forEach(async (roleId) => {
          let communityrole = "";
          try {
            communityrole = await member.guild.roles.fetch(roleId);
            await member.roles.add(communityrole).catch((error) => {});
          } catch (error) {}
        });
      }
    }
  }, 5000);
};

const userCountSpecial = async (member) => {
  let nextUserCountSpecialValue = "";
  let insertOrUpdate = "";
  const newUser = await usersRepository.getUser(member.id, member.guild.id);

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

  const logText5 = `Guild: ${member.guild.name} (${member.guild.id}) | Next member achievement: ${newUser.ID}/${nextUserCountSpecialValue}`;
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
          .send({ content: `@here`, embeds: [UserCountSpecialEmbed] })
          .catch((error) => {});
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

    const logText6 = `Guild: ${member.guild.name} (${member.guild.id}) | RankUp --> Next member achievement: ${newUser.ID}/${nextUserCountSpecialValueNew}`;
    loggingHandler.log(logText6, "memberAdd");
  }
};
