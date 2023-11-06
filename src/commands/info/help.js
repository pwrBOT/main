const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const levelsRepository = require("../../mysql/levelsRepository");

module.exports = {
  name: "help",
  category: "info",
  description: "Hilfe zu Bot Funktionen erhalten",
  data: new SlashCommandBuilder()
    .setName(`help`)
    .setDescription(`Hilfe zu Bot Funktionen erhalten`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`reportsystem`)
        .setDescription(`Informationen über das Report-System ausgeben lassen`)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`levelsystem`)
        .setDescription(`Informationen über das Level-System ausgeben lassen`)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });

      const { member, guild } = interaction;

      // ########################## INFO LEVEL SYSTEM ########################## \\
      if (interaction.options.getSubcommand() === "levelsystem") {
        const levelSettings = await levelsRepository.getlevelSettings(guild);

        let statusLevelRoles = "";
        if (levelSettings.levelRolesActive == 1) {
          statusLevelRoles = "Active";
        }

        let statusVoiceXP = "";
        if (levelSettings.channelTimeXP == 1) {
          statusVoiceXP = "Active";
        }

        // DEFINE CHANNELS
        let voiceXPCategorys = "";
        let voiceChannelIds = "";
        try {
          voiceChannelIds = JSON.parse(levelSettings.channelTimeXPCategoryIds);
        } catch (error) {}

        if (voiceChannelIds) {
          voiceChannelIds.forEach(async (channel) => {
            const categorys = await guild.channels.fetch(channel).catch(error => {});
            voiceXPCategorys += `${categorys}\n`;
          });
        } else {
          voiceXPCategorys = "-";
        }

        let voiceXPBoostCategorys = "";
        let voiceBoostChannelIds = "";
        try {
          voiceBoostChannelIds = JSON.parse(levelSettings.channelXpBoostIds);
        } catch (error) {}

        if (voiceBoostChannelIds) {
          voiceBoostChannelIds.forEach(async (channel) => {
            const categorys = await guild.channels.fetch(channel);
            voiceXPBoostCategorys += `${categorys}\n`;
          });
        } else {
          voiceXPBoostCategorys = "-";
        }

        // DEFINE ROLES
        let levelRoles = "";
        let roleLevel1 = "";
        let roleLevel2 = "";
        let roleLevel3 = "";
        let roleLevel4 = "";
        let roleLevel5 = "";
        let roleLevel6 = "";
        let roleLevel7 = "";
        let roleLevel8 = "";
        let roleLevel9 = "";
        let roleLevel10 = "";

        if (levelSettings.level1) {
          roleLevel1 = await guild.roles.fetch(levelSettings.level1);
          levelRoles += `Level ${levelSettings.LevelUp1} (XP: ${
            (levelSettings.LevelUp1 - 1) * (levelSettings.LevelUp1 - 1) * 100 +
            100
          }): ${roleLevel1}\n`;
        }

        if (levelSettings.level2) {
          roleLevel2 = await guild.roles.fetch(levelSettings.level2);
          levelRoles += `Level ${levelSettings.LevelUp2} (XP: ${
            (levelSettings.LevelUp2 - 1) * (levelSettings.LevelUp2 - 1) * 100 +
            100
          }): ${roleLevel2}\n`;
        }

        if (levelSettings.level3) {
          roleLevel3 = await guild.roles.fetch(levelSettings.level3);
          levelRoles += `Level ${levelSettings.LevelUp3} (XP: ${
            (levelSettings.LevelUp3 - 1) * (levelSettings.LevelUp3 - 1) * 100 +
            100
          }): ${roleLevel3}\n`;
        }

        if (levelSettings.level4) {
          roleLevel4 = await guild.roles.fetch(levelSettings.level4);
          levelRoles += `Level ${levelSettings.LevelUp4} (XP: ${
            (levelSettings.LevelUp4 - 1) * (levelSettings.LevelUp4 - 1) * 100 +
            100
          }): ${roleLevel4}\n`;
        }

        if (levelSettings.level5) {
          roleLevel5 = await guild.roles.fetch(levelSettings.level5);
          levelRoles += `Level ${levelSettings.LevelUp5} (XP: ${
            (levelSettings.LevelUp5 - 1) * (levelSettings.LevelUp5 - 1) * 100 +
            100
          }): ${roleLevel5}\n`;
        }

        if (levelSettings.level6) {
          roleLevel6 = await guild.roles.fetch(levelSettings.level6);
          levelRoles += `Level ${levelSettings.LevelUp6} (XP: ${
            (levelSettings.LevelUp6 - 1) * (levelSettings.LevelUp6 - 1) * 100 +
            100
          }): ${roleLevel6}\n`;
        }

        if (levelSettings.level7) {
          roleLevel7 = await guild.roles.fetch(levelSettings.level7);
          levelRoles += `Level ${levelSettings.LevelUp7} (XP: ${
            (levelSettings.LevelUp7 - 1) * (levelSettings.LevelUp7 - 1) * 100 +
            100
          }): ${roleLevel7}\n`;
        }

        if (levelSettings.level8) {
          roleLevel8 = await guild.roles.fetch(levelSettings.level8);
          levelRoles += `Level ${levelSettings.LevelUp8} (XP: ${
            (levelSettings.LevelUp8 - 1) * (levelSettings.LevelUp8 - 1) * 100 +
            100
          }): ${roleLevel8}\n`;
        }

        if (levelSettings.level9) {
          roleLevel9 = await guild.roles.fetch(levelSettings.level9);
          levelRoles += `Level ${levelSettings.LevelUp9} (XP: ${
            (levelSettings.LevelUp9 - 1) * (levelSettings.LevelUp9 - 1) * 100 +
            100
          }): ${roleLevel9}\n`;
        }

        if (levelSettings.level10) {
          roleLevel10 = await guild.roles.fetch(levelSettings.level10);
          levelRoles += `Level ${levelSettings.LevelUp10} (XP: ${
            (levelSettings.LevelUp10 - 1) *
              (levelSettings.LevelUp10 - 1) *
              100 +
            100
          }): ${roleLevel10}`;
        }

        // EMBED

        const levelEmbed = new EmbedBuilder()
          .setTitle(`❔ Help | Level-System`)
          .setDescription(
            `Das Level System bietet Usern die Möglichkeit zu leveln und Rollenbelohnungen zu erhalten. Hierfür benötigt man XP, welche man durch folgende Aktionen bekommt:

        1️⃣ Durch Schreiben von Nachrichten
        2️⃣ Durch Verbringen von Zeit in Voice-Channels
        
        Hier eine Auflistung welche Features bei ${guild.name} aktiviert sind und welche Rollen du bekommen kannst:`
          )
          .setColor(0x0fbaff)
          .setTimestamp(Date.now())
          .setThumbnail(guild.iconURL())
          // .setImage(`https://pwr.lol/img/discord_embed.jpg`)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Level-System Status:`,
              value: `${statusLevelRoles}\n\u200B`,
              inline: true
            },
            {
              name: `XP in Voice-Channel:`,
              value: `${statusVoiceXP}\n\u200B`,
              inline: true
            },
            {
              name: `Level-Channel (/userbanner):`,
              value: `${await guild.channels.fetch(
                levelSettings.rankChannel
              )}\n\u200B`,
              inline: true
            },
            {
              name: `🏆 Rollenbelohnungen:`,
              value: `${levelRoles}\n\u200B`,
              inline: false
            },
            {
              name: `🎤 Kategorien | Voice-Channel XP:`,
              value: `${voiceXPCategorys}\n\u200B`,
              inline: false
            },
            {
              name: `🎤 Kategorien | Voice-Channel XP-Boost:`,
              value: `${voiceXPBoostCategorys}`,
              inline: false
            }
          ]);

        interaction.editReply({
          embeds: [levelEmbed]
        });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        commandLogRepository.logCommandUse(
          interaction.guild,
          "help level-system",
          interaction.user,
          member.user,
          "-"
        );
        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "reportsystem") {
        const reportSystemEmbed = new EmbedBuilder()
          .setTitle(`❔ Help | Report-System`)
          .setDescription(
            `Mit dem Report System kann ein User einfach und unkompliziert gemeldet werden. 
          Dies funktioniert per Rechtsklick auf den User --> Apps --> User melden ODER per /report.
          
          Wurde ein User gemeldet, bekommen alle Moderatoren eine Benachrichtigung. 
          Der nächste freie Moderator übernimmt den Report und prüft ihn. Reports können auch abgelehnt werden.
          
          Wird der Report weiter bearbeitet, erstellt der Bot automatisch einen Thread in der jeweiligen Mod-Area und fügt den gemeldeten User hinzu. So kann die Beschwerde sauber abgearbeitet und dokumentiert werden.
          
          Zum Schluss wird der Report abgeschlossen. Der Melder wird per DM vom Bot informiert. Auch wird der Thread innerhalb von 24h automatisch archiviert.`
          )
          .setColor(0x0fbaff)
          .setTimestamp(Date.now())
          .setThumbnail(guild.iconURL())
          .setImage(`https://pwr.lol/img/powerbot_reportSystem.jpg`)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          });

        interaction.editReply({
          ephemeral: true,
          embeds: [reportSystemEmbed]
        });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        commandLogRepository.logCommandUse(
          interaction.guild,
          "help report-system",
          interaction.user,
          member.user,
          "-"
        );
        return resolve(null);
      }

      return resolve(null);
    });
  }
};
