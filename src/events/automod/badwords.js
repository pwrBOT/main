const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const guildSettings = require("../../mysql/guildsRepository");
const warnSystem = require("../../functions/warningSystem/warnings");
const loggingHandler = require("../../functions/fileLogging/loggingHandler");
const userlogRepository = require("../../mysql/userlogRepository");
const ms = require("ms");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    return new Promise(async resolve => {
      if (!message.member) {
        if (!message) {
          console.log(
            chalk.yellow(
              `[${new Date().toLocaleDateString(
                "de-DE"
              )} / ${new Date().toLocaleTimeString(
                "de-DE"
              )}] BADWORD | ERR --> NO MESSAGE.MEMBER DEFINED`
            )
          );
        }
        return resolve(null);
      }

      if (!message.guild) {
        if (!message) {
          console.log(
            chalk.yellow(
              `[${new Date().toLocaleDateString(
                "de-DE"
              )} / ${new Date().toLocaleTimeString(
                "de-DE"
              )}] BADWORD | ERR --> NO MESSAGE.GUILD DEFINED`
            )
          );
        }
        return resolve(null);
      }

      if (message.author.bot == true) {
        return resolve(null);
      }

      autoModBadwords = await guildSettings.getGuildSetting(
        message.guild,
        "autoModBadwords"
      );

      if (!autoModBadwords) {
        return resolve(null);
      }

      if (autoModBadwords.value.length === 0) {
        return resolve(null);
      }

      let badwords = await guildSettings.getGuildSetting(
        message.guild,
        "badwords"
      );

      if (badwords == undefined) {
      } else {
        for (const badword of JSON.parse(badwords.value.toLowerCase())) {
          if (message.content.toLowerCase().includes(badword)) {
            deleteMessage();
            userTimeout();
            autoModWarnMember();

            return resolve(null);
          }
        }
      }
      async function deleteMessage() {
        const modRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "modRole"
        );

        if (message.member.roles.cache.has(modRoleId.value)) {
          return resolve(null);
        }

        if (message.guild.ownerId === message.member.id) {
          return resolve(null);
        }

        if (message.member.manageable === false) {
          return resolve(null);
        }
        try {
          await message.delete();
          await message.channel.send(
            `_Nachricht von ${message.member} gelöscht! (Auto Mod | Bad Word)_`
          );
        } catch (error) {}

        const logText = `[${new Date().toLocaleDateString(
          "de-DE"
        )} / ${new Date().toLocaleTimeString(
          "de-DE"
        )}] AUTO MOD BADWORD | Nachricht (${message.content}) von ${message
          .member.user.username} gelöscht. Server: ${message.guild.name} (${message
          .guild.id}).`;
        loggingHandler.log(logText, "autoMod");

        await userlogRepository.addLog(
          message.guild.id,
          message.member.user.username,
          "BADWORD",
          "AUTOMOD",
          message.content,
          "-",
          "-",
          "-"
        );
      }

      async function userTimeout() {
        const modRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "modRole"
        );

        if (message.member.roles.cache.has(modRoleId.value)) {
          return resolve(null);
        }

        if (message.guild.ownerId === message.member.id) {
          return resolve(null);
        }

        if (message.member.manageable === false) {
          return resolve(null);
        }

        const length = "1h";
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
              value: `Auto-Mod | Bad Word`,
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
            `Du wurdest getimeouted!\nServer: "${message.guild
              .name}"\nDauer: ${length}!`
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
              value: `Auto-Mod | Bad Word`,
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

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(message.guild, "modLog", modlogembed);

        try {
          message.member.timeout(ms(length), "Auto-Mod | Bad Word");
        } catch (error) {}

        try {
          await message.member
            .send({ embeds: [embedmember] })
            .catch(error => {});
        } catch (error) {}

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod | Timout Auto-Mod | Bad Word",
          message.client.user,
          message.member.user,
          "-"
        );

        return resolve(null);
      }

      async function autoModWarnMember() {
        const modRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "modRole"
        );

        if (message.member.roles.cache.has(modRoleId.value)) {
          return resolve(null);
        }

        if (message.guild.ownerId === message.member.id) {
          return resolve(null);
        }

        if (message.member.manageable === false) {
          return resolve(null);
        }
        let userMessage = "";

        if (message.content) {
          userMessage = message.content;
        } else {
          userMessage = "-";
        }

        const warnembed = new EmbedBuilder()
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(`User: ${message.member.nickname} (${message.member}) wurde verwarnt`)
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
              value: `Auto-Mod | Bad Word`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: `Auto-Mod`,
              inline: true
            },
            {
              name: `Nachricht:`,
              value: `${userMessage}`,
              inline: false
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
              value: `Auto-Mod | Bad Word`,
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

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(message.guild, "modLog", warnembed);

        try {
          await message.member
            .send({ embeds: [warnembedmember] })
            .catch(error => {});
        } catch (error) {}

        await warnSystem.warnUser(
          message.guild,
          message.member,
          "Auto-Mod | Bad Word",
          message.client.user.username,
          message.client.user.id
        );
        await warnSystem.autoModWarn(message.guild, message.member);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod Warn | Bad Word",
          message.client.user,
          message.member.user,
          "-"
        );

        const logText2 = `[${new Date().toLocaleDateString(
          "de-DE"
        )} / ${new Date().toLocaleTimeString(
          "de-DE"
        )}] AUTO MOD BADWORDS | User ${message.member.user
          .tag} wurde verwarnt. Server: ${message.guild.name}.`;
        loggingHandler.log(logText2, "autoMod");
      }
    });
  }
};
