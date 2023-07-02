const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const warnsRepository = require("../../mysql/warnsRepository");
const guildSettings = require("../../mysql/guildsRepository");
const usersRepository = require("../../mysql/usersRepository");
const warnSystem = require("../../functions/warningSystem/warnings");
const loggingChannelsRepository = require("../../mysql/loggingChannelsRepository");
const xPSystemGiveRole = require("../../functions/userManagement/xPSystemGiveRole");
const ms = require("ms");
const antiSpamMap = new Map();
const xPWaitMap = new Map();

module.exports = {
  name: "messageCreate",
  async execute(message) {
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

      const oldLevel = getUser.Level;

      const newUserMessageCount = parseInt(getUser.messageCount) + 1;
      await usersRepository.updateUser(
        guildId,
        message.author.id,
        "messageCount",
        newUserMessageCount
      );

      const teamRoleId = await guildSettings.getGuildSetting(
        message.guild,
        "teamRole"
      );

      // ANTISPAM SYSTEM
      const LIMIT = 5;
      const TIME = 60000;
      const DIFF = 10000;
      const length = "1h";

      if (antiSpamMap.has(message.author.id)) {
        const userData = antiSpamMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference =
          message.createdTimestamp - lastMessage.createdTimestamp;
        let msgCount = userData.msgCount;

        if (difference > DIFF) {
          clearTimeout(timer);
          userData.msgCount = 1;
          userData.lastMessage = message;
          userData.timer = setTimeout(() => {
            antiSpamMap.delete(message.author.id);
          }, TIME);
          antiSpamMap.set(message.author.id, userData);
        } else {
          /// SPAM SYSTEM SCHLAEGT AN \\\
          ++msgCount;
          if (parseInt(msgCount) === LIMIT) {
            try {
              if (message.member.roles.cache.has(teamRoleId.value)) {
                console.log(
                  `SPAM CHECK | Nachricht von ${message.author.tag} nicht gelöscht --> Team Mitglied`
                );
                return resolve(null);
              }
            } catch (error) {}
            
            userTimeout();
            autoModWarnMember();

            try {
              message.delete();
              message.channel.send(
                `${message.member} deine Nachricht wurde gelöscht. Spam ist nicht erwünscht 😡!`
              );
            } catch (error) {}

            console.log(`Spam Limit von ${message.author.tag} ausgelöst`);
            return resolve(null);
          } else {
            userData.msgCount = msgCount;
            antiSpamMap.set(message.author.id, userData);
          }
        }
      } else {
        let fn = setTimeout(() => {
          antiSpamMap.delete(message.author.id);
        }, TIME);
        antiSpamMap.set(message.author.id, {
          msgCount: 1,
          lastMessage: message,
          timer: TIME
        });
        giveXP();
      }

      async function giveXP() {
        const WAITTIME = 60000;
        if (xPWaitMap.has(message.author.id)) {
          const userData = xPWaitMap.get(message.author.id);
          const { timer } = userData;
          userData.timer = setTimeout(() => {
            xPWaitMap.delete(message.author.id);
          }, WAITTIME);
        } else {
          let fn = setTimeout(() => {
            xPWaitMap.delete(message.author.id);
          }, WAITTIME);
          xPWaitMap.set(message.author.id, {
            msgCount: 1,
            lastMessage: message,
            timer: WAITTIME
          });

          // console.log(`${message.author.tag} hat XP bekommen`);

          let currentXP = getUser.xP;
          if (!currentXP) {
            currentXP = 0;
          }
          let XP = Math.floor(Math.random() * (25 - 6 + 1)) + 6;
          var newXP = parseInt(currentXP) + XP;

          await usersRepository.updateUser(
            guildId,
            message.author.id,
            "xP",
            newXP
          );

          const requiredXP = getUser.Level * getUser.Level * 100 + 100;

          if (newXP >= requiredXP) {
            let newLevel = (getUser.Level += 1);
            await usersRepository.updateUser(
              guildId,
              message.author.id,
              "Level",
              newLevel
            );
          }

          await xPSystemGiveRole.autoUserRoles(
            message.guild,
            message.member,
            oldLevel
          );

          const loggingHandler = require("../../functions/fileLogging/loggingHandler");
          const logText = `GUILD: ${message.guild.id} | #GET XP --> USER: ${message.member.displayName} (ID: ${message.member.id}) XP: ${currentXP} + ${XP} = ${newXP}`;
          loggingHandler.log(logText, "xP_logging");
        }
        return resolve(null);
      }

      async function userTimeout() {

        if (message.member.isCommunicationDisabled()) {
          return resolve(null);
        }

        try {
          if (message.member.roles.cache.has(teamRoleId.value)) {
            return resolve(null);
          }
        } catch (error) {}

        if (message.guild.ownerId === message.member.id) {
          return resolve(null);
        }

        if (message.member.manageable === false) {
          return resolve(null);
        }

        const length = "1h";
        message.member.timeout(ms(length), "Auto-Mod | Spam").catch(error => {})

        const guildsRepository = require("../../mysql/guildsRepository");
        const embedInfo = await guildsRepository.getGuildSetting(
          message.guild,
          "embedinfo"
        );
        if (!embedInfo) {
          embedInfo = "Bei Fragen wende dich an die Communityleitung!";
        }

        const modlogembed = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(
            `User: ${message.member} wurde getimeouted!\nDauer: ${length}`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.member.displayAvatarURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Auto-Mod | Spam`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: "Auto-Mod",
              inline: true
            }
          ]);

        const embedmember = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(
            `Du wurdest getimeouted!\nServer: "${message.guild.name}"\nDauer: ${length}!`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.guild.iconURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Spam! Du hast zu viele Nachrichten hintereinander geschickt.`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: "Auto-Mod",
              inline: true
            },
            {
              name: `Information:`,
              value: `${embedInfo.value}`,
              inline: false
            }
          ]);

        await loggingChannelsRepository.logChannel(
          message.guild,
          "modLog",
          modlogembed
        );

        try {
          await message.member
            .send({ embeds: [embedmember] })
            .catch((error) => {});
        } catch (error) {}

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod | Timout Spam",
          message.client.user,
          message.member.user,
          "-"
        );

        return resolve(null);
      }

      async function autoModWarnMember() {
        

        try {
          if (message.member.roles.cache.has(teamRoleId.value)) {
            console.log(
              `SPAM CHECK | ${message.author.tag} Verwarnung gestoppt --> Team Mitglied`
            );
            return resolve(null);
          }
        } catch (error) {}

        if (message.member.id === message.client.user.id) {
          return resolve(null);
        }

        if (message.guild.ownerId === message.member.id) {
          console.log(
            `SPAM CHECK | ${message.author.tag} Verwarnung gestoppt --> Server Owner`
          );
          return resolve(null);
        }

        const warnembed = new EmbedBuilder()
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(`User: ${message.member.displayName} (${message.member}) wurde verwarnt`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.member.displayAvatarURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Spam`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: `Auto-Mod`,
              inline: true
            }
          ]);

        const warnembedmember = new EmbedBuilder()
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(
            `Du wurdest soeben verwarnt!\nServer: ${message.guild.name}`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.guild.iconURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Spam`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: `Auto-Mod`,
              inline: true
            },
            {
              name: `Information:`,
              value: `Bei Fragen wende dich bitte an die Projektleitung`,
              inline: false
            }
          ]);

        await loggingChannelsRepository.logChannel(
          message.guild,
          "modLog",
          warnembed
        );

        await message.channel.send({ embeds: [warnembed] });

        try {
          await message.member
            .send({ embeds: [warnembedmember] })
            .catch((error) => {});
        } catch (error) {}

        await warnSystem.warnUser(
          message.guild,
          message.member,
          "Auto-Mod | Spam",
          message.client.user.tag,
          message.client.user.id
        );
        await warnSystem.autoModWarn(message.guild, message.member);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod Warn | Spam Check",
          message.client.user,
          message.member.user,
          "-"
        );

        console.log(
          chalk.yellow(
            `[${new Date().toLocaleDateString(
              "de-DE"
            )} / ${new Date().toLocaleTimeString(
              "de-DE"
            )}] Auto-Mod Warn | Spam Check: ${
              message.member.user.tag
            } wurde verwarnt. Server: ${message.guild.name}.`
          )
        );
      }
      return resolve(null);
    });
  }
};
