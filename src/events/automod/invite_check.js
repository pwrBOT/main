const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const guildSettings = require("../../mysql/guildsRepository");
const warnSystem = require("../../functions/warningSystem/warnings");
const userlogRepository = require("../../mysql/userlogRepository");
const fetch = require("node-fetch");
const ms = require("ms");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    return new Promise(async (resolve) => {
      if (!message) {
        console.log(
          chalk.yellow(
            `[${new Date().toLocaleDateString(
              "de-DE"
            )} / ${new Date().toLocaleTimeString(
              "de-DE"
            )}] AUTO MOD INVITE | STOPP --> NO MESSAGE`
          )
        );
        return resolve(null);
      }

      if (!message.member) {
        if (!message) {
          console.log(
            chalk.yellow(
              `[${new Date().toLocaleDateString(
                "de-DE"
              )} / ${new Date().toLocaleTimeString(
                "de-DE"
              )}] AUTO MOD INVITE | STOPP --> NO MESSAGE.MEMBER`
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
              )}] AUTO MOD INVITE | STOPP --> NO MESSAGE.GUILD`
            )
          );
        }
        return resolve(null);
      }

      let autoModInvites = "";

      if (message.guild) {
        autoModInvites = await guildSettings.getGuildSetting(
          message.guild,
          "autoModInvites"
        );
      }

      if (!autoModInvites) {
        return resolve(null);
      }

      if (!autoModInvites.value) {
        return resolve(null);
      }

      // ####################    CHECK     ################## \\
      if (message.content.includes("discord.gg/")) {
        const links = getFullUrls(message.content);

        for (const link of links) {
          if (link.includes("discord.gg/")) {
            let isGuildInvite = false;

            var inviteCode = "";
            inviteCode = link
              .split("/")
              .pop()
              .replaceAll(/[^a-zA-Z0-9]/g, "");

            const invite = await message.guild
              .fetchVanityData()
              .catch((error) => {});

            if (
              !inviteCode ||
              inviteCode == invite?.code.replaceAll(/[^a-zA-Z0-9]/g, "")
            ) {
              isGuildInvite = true;
            } else {
              await message.guild.invites
                .fetch({ code: inviteCode, cache: true })
                .then(() => {
                  isGuildInvite = true;
                })
                .catch(() => {});

              await message.guild.invites
                .fetch({ code: inviteCode, force: true })
                .then(() => {
                  isGuildInvite = true;
                })
                .catch(() => {});
            }

            if (!isGuildInvite) {
              console.log(`${link} / ${inviteCode}`);
              userTimeout();
              deleteMessage();
              autoModWarnMember();
              await warnSystem.autoModWarn(message.guild, message.member);
              return resolve(null);
            }
          } else {
          }
        }
      }

      if (message.content.includes("discord.com/invite/")) {
        const links = getFullUrls(message.content);

        for (const link of links) {
          if (link.includes("discord.com/invite/")) {
            let isGuildInvite = false;

            var inviteCode = "";
            inviteCode = link
              .split("/")
              .pop()
              .replaceAll(/[^a-zA-Z0-9]/g, "");

            await message.guild.invites
              .fetch({ code: inviteCode, cache: true })
              .then(() => {
                isGuildInvite = true;
              })
              .catch(() => {});

            await message.guild.invites
              .fetch({ code: inviteCode, force: true })
              .then(() => {
                isGuildInvite = true;
              })
              .catch(() => {});

            if (!isGuildInvite) {
              console.log(`${link} / ${inviteCode}`);
              userTimeout();
              deleteMessage();
              autoModWarnMember();
              await warnSystem.autoModWarn(message.guild, message.member);
              return resolve(null);
            }
          } else {
          }
        }
      }

      if (message.content.includes("discord.com/channels/")) {
        const inviteCodeOfGuild = message.content.includes(message.guild.id);
        if (inviteCodeOfGuild === false) {
          userTimeout();
          deleteMessage();
          autoModWarnMember();
          await warnSystem.autoModWarn(message.guild, message.member);
          return resolve(null);
        }
      }

      if (message.content.includes("discordapp.com/channels/")) {
        const inviteCodeOfGuild = message.content.includes(message.guild.id);
        if (inviteCodeOfGuild === false) {
          userTimeout();
          deleteMessage();
          autoModWarnMember();
          await warnSystem.autoModWarn(message.guild, message.member);
          return resolve(null);
        }
      }

      function getFullUrls(text) {
        let urlRegex = ""
        if (text.includes("http")) {
          urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
        } else {
          urlRegex = /(((https?:\/\/)|(www\.)|(discord?.\.))[^\s]+)/g;
        }
        return text.match(urlRegex);
      }

      async function deleteMessage() {
        const teamRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "teamRole"
        );

        try {
          if (message.member.roles.cache.has(teamRoleId.value)) {
            console.log(
              chalk.yellow(
                `[${new Date().toLocaleDateString(
                  "de-DE"
                )} / ${new Date().toLocaleTimeString(
                  "de-DE"
                )}] AUTO MOD INVITE | STOPP --> TEAM MEMBER`
              )
            );
            return resolve(null);
          }
        } catch (error) {}

        if (message.member.id === message.client.user.id) {
          return resolve(null);
        }

        if (message.guild.ownerId === message.member.id) {
          return resolve(null);
        }

        try {
          await message.delete();
          await message.channel.send(
            `_Auto-Mod | Invite Check --> Nachricht von ${message.member} gelöscht!_`
          );
        } catch (error) {}

        console.log(
          chalk.yellow(
            `[${new Date().toLocaleDateString(
              "de-DE"
            )} / ${new Date().toLocaleTimeString(
              "de-DE"
            )}] AUTO MOD INVITE | Nachricht (${message.content}) von ${
              message.member.user.username
            } gelöscht. Server: ${message.guild.name}.`
          )
        );

        await userlogRepository.addLog(
          message.guild.id,
          message.member.user.username,
          "INVITECHECK",
          "AUTOMOD",
          message.content,
          "-",
          "-",
          "-"
        );
      }

      async function userTimeout() {
        const teamRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "teamRole"
        );

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

        if (message.member.isCommunicationDisabled()) {
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
              value: `Auto-Mod | Invite Check`,
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
              value: `Auto-Mod | Invite Check`,
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

        try {
          message.member.timeout(ms(length), "Auto-Mod | Invite Check");
        } catch (error) {}

        try {
          await message.member
            .send({ embeds: [embedmember] })
            .catch((error) => {});
        } catch (error) {}

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod | Timout Auto-Mod | Invite Check",
          message.client.user,
          message.member.user,
          "-"
        );

        return resolve(null);
      }

      async function autoModWarnMember() {
        const teamRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "teamRole"
        );

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

        let userMessage = "";

        if (message.content) {
          userMessage = message.content;
        } else {
          userMessage = "-";
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
              value: `Auto-Mod | Invite Check`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: `Auto-Mod`,
              inline: true
            },
            {
              name: `Nachricht:`,
              value: `${userMessage}\nChannel: ${message.channel}`,
              inline: false
            }
          ]);

        const warnembedChannel = new EmbedBuilder()
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
              value: `Auto-Mod | Invite Check`,
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
              value: `Auto-Mod | Invite Check`,
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
            },
            {
              name: `Information:`,
              value: `Bei Fragen wende dich bitte an die Projektleitung`,
              inline: false
            }
          ]);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(message.guild, "modLog", warnembed);

        await message.channel.send({ embeds: [warnembedChannel] });

        try {
          await message.member
            .send({ embeds: [warnembedmember] })
            .catch((error) => {});
        } catch (error) {}

        await warnSystem.warnUser(
          message.guild,
          message.member,
          "Auto-Mod | Invite Check",
          message.client.user.username,
          message.client.user.id
        );
        await warnSystem.autoModWarn(message.guild, message.member);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod Warn | Invite Check",
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
            )}] AUTO MOD INVITE | User ${
              message.member.user.username
            } wurde verwarnt. Server: ${message.guild.name}.`
          )
        );
      }
    });
  }
};
