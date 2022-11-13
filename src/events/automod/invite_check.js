const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const warnsRepository = require("../../mysql/warnsRepository");
const guildSettings = require("../../mysql/guildsRepository");
const autoModSanctions = require("../../events/eventFunctions/autoModSanctions");
const ms = require("ms");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    return new Promise(async (resolve) => {
      if (!message) {
        return resolve(null);
      }

      const inviteLinks = ["discord.gg/", "discord.com/invite/"];

      for (const link of inviteLinks) {
        if (!message.content.includes(link)) {
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
          console.log(chalk.yellow(`AUTO MOD INVITE | KEINE SETTINGS`));
          return resolve(null);
        }

        if (autoModInvites.length === 0) {
          console.log(chalk.yellow(`AUTO MOD INVITE | SYSTEM DEAKTIVIERT`));
          return resolve(null);
        }

        async function deleteMessage() {
          const teamRoleId = await guildSettings.getGuildSetting(
            message.guild,
            "teamRole"
          );

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

          if (message.member.id === message.client.user.id) {
            return resolve(null);
          }

          if (message.guild.ownerId === message.member.id) {
            return resolve(null);
          }

          try {
            await message.delete();
          } catch (error) {}

          console.log(
            chalk.yellow(
              `[${new Date().toLocaleDateString(
                "de-DE"
              )} / ${new Date().toLocaleTimeString(
                "de-DE"
              )}] AUTO MOD INVITE | Nachricht (${message.content}) von ${
                message.member.user.tag
              } gelöscht. Server: ${message.guild.name}.`
            )
          );
        }

        async function userTimeout() {
          const teamRoleId = await guildSettings.getGuildSetting(
            message.guild,
            "teamRole"
          );
    
          if (message.member.roles.cache.has(teamRoleId.value)) {
            return resolve(null);
          }
    
          if (message.guild.ownerId === message.member.id) {
            return resolve(null);
          }
    
          if (message.member.manageable === false) {
            return resolve(null);
          }
    
          const length = "5m";
          const guildsRepository = require("../../mysql/guildsRepository");
          const embedInfo = await guildsRepository.getGuildSetting(
            message.guild,
            "embedinfo"
          );
          if (!embedInfo) {
            embedInfo = "Bei Fragen wende dich an die Communityleitung!";
          }
    
          const modlogembed = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `User: ${message.member} wurde getimeouted!\nDauer: ${length}`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(message.member.displayAvatarURL())
            .setFooter({
              iconURL: message.client.user.displayAvatarURL(),
              text: `powered by Powerbot`,
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Auto-Mod | Spam`,
                inline: true,
              },
              {
                name: `Moderator:`,
                value: "Auto-Mod",
                inline: true,
              },
            ]);
    
          const embedmember = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest getimeouted!\nServer: "${message.guild.name}"\nDauer: ${length}!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(message.guild.iconURL())
            .setFooter({
              iconURL: message.client.user.displayAvatarURL(),
              text: `powered by Powerbot`,
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Auto-Mod | Spam`,
                inline: true,
              },
              {
                name: `Moderator:`,
                value: "Auto-Mod",
                inline: true,
              },
              {
                name: `Information:`,
                value: `${embedInfo.value}`,
                inline: false,
              },
            ]);
    
          const logChannel = require("../../mysql/loggingChannelsRepository");
          await logChannel.logChannel(message.guild, "modLog", modlogembed);
    
          try {
            message.member.timeout(ms(length), "Auto-Mod | Spam");
          } catch (error) {}
    
          try {
            await message.member.send({ embeds: [embedmember] });
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
          const teamRoleId = await guildSettings.getGuildSetting(
            message.guild,
            "teamRole"
          );

          if (message.member.roles.cache.has(teamRoleId.value)) {
            return resolve(null);
          }

          if (message.member.id === message.client.user.id) {
            return resolve(null);
          }

          if (message.guild.ownerId === message.member.id) {
            return resolve(null);
          }

          if (message.member.manageable === false) {
            return resolve(null);
          }

          const warnembed = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
            .setDescription(`User: ${message.member} wurde verwarnt`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(message.member.displayAvatarURL())
            .setFooter({
              iconURL: message.client.user.displayAvatarURL(),
              text: `powered by Powerbot`,
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Eigen- / Fremdwerbung`,
                inline: true,
              },
              {
                name: `Moderator:`,
                value: `Auto-Mod`,
                inline: true,
              },
            ]);

          const warnembedmember = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
            .setDescription(
              `Du wurdest soeben verwarnt!\nServer: ${message.guild.name}`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(message.guild.iconURL())
            .setFooter({
              iconURL: message.client.user.displayAvatarURL(),
              text: `powered by Powerbot`,
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Eigen- / Fremdwerbung`,
                inline: true,
              },
              {
                name: `Moderator:`,
                value: `Auto-Mod`,
                inline: true,
              },
              {
                name: `Information:`,
                value: `Bei Fragen wende dich bitte an die Projektleitung`,
                inline: false,
              },
            ]);

          const logChannel = require("../../mysql/loggingChannelsRepository");
          await logChannel.logChannel(message.guild, "modLog", warnembed);

          await message.channel.send({ embeds: [warnembed] });

          try {
            await message.member.send({ embeds: [warnembedmember] });
          } catch (error) {}

          await warnsRepository.addWarn(
            message.guild.id,
            message.member.id,
            "Eigen- / Fremdwerbung",
            message.client.user.tag,
            message.client.user.id
          );
          const commandLogRepository = require("../../mysql/commandLogRepository");
          // guild - command, user, affectedMember, reason
          await commandLogRepository.logCommandUse(
            message.guild,
            "Auto-Mod Warn | Invite",
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
                message.member.user.tag
              } wurde verwarnt. Server: ${message.guild.name}.`
            )
          );
        }

        // ####################    CHECK     ################## \\

        const inviteCode = await message.content.split(link)[1].split(" ")[0].split("\n")[0];

        let isGuildInvite = "";
        try {
          isGuildInvite = await message.guild.invites.fetch({
            code: `${inviteCode}`,
          });
        } catch (error) {
          isGuildInvite = false;
        }

        if (!isGuildInvite) {
          try {
            const vanity = await message.guild.fetchVanityData();
            if (code !== vanity?.code) {
              deleteMessage();
              autoModWarnMember();
              userTimeout();
              autoModSanctions.autoModSanctions(message.guild, message.member);
              return resolve(null);
            }
          } catch (err) {
            deleteMessage();
            autoModWarnMember();
            userTimeout();
            autoModSanctions.autoModSanctions(message.guild, message.member);
            return resolve(null);
          }
        }
      }
    });
  },
};
