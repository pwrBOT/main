const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const warnsRepository = require("../../mysql/warnsRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = {
  name: "warns",
  category: "warning",
  description: "Warns eines Users anzeigen oder löschen",
  data: new SlashCommandBuilder()
    .setName(`warns`)
    .setDescription(`Warns eines Users anzeigen oder löschen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`show`)
        .setDescription(`Warns eines Users anzeigen`)
        .addUserOption((option) =>
          option.setName("user").setDescription("User").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`delete`)
        .setDescription(`Warn eines Users löschen`)
        .addUserOption((option) =>
          option.setName("user").setDescription("User").setRequired(true)
        )
        .addNumberOption((option) =>
          option.setName("id").setDescription("Warn ID").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`clearall`)
        .setDescription(`Alle Warns eines Users löschen`)
        .addUserOption((option) =>
          option.setName("user").setDescription("User").setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const member = interaction.options.getMember("user");
      const channel = interaction.channel.id;
      const warnId = interaction.options.getNumber("id");
      const warns = await warnsRepository.getWarns(member, 10);

      if (interaction.options.getSubcommand() === "show") {
        if (!warns) {
          return resolve(null);
        }

        if (warns.length === 0) {
          interaction.reply(`${member} hat keine Verwarnungen!`);
          setTimeout(function () {
            interaction.deleteReply();
          }, 3000);
          return resolve(null);
        }

        var warnsText = "";
        warns.forEach((warn) => {
          const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
          const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const spacer = `\u00A0\u00A0\u00A0\u00A0`;
          warnsText += `ID: ${warn.ID} | ${date}  •  ${time}h:${spacer}${warn.warnReason}\n`;
        });

        const warnsembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
          .setDescription(`Warns-Übersicht von ${member}`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .addFields([
            {
              name: `Letzten 10 Verwarnungen:`,
              value: `${warnsText}`,
              inline: false,
            },
          ])
          .addFields([
            {
              name: `Angefordert von:`,
              value: `${interaction.user.tag}`,
              inline: false,
            },
          ]);
        interaction.reply({ embeds: [warnsembed] });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "warns show",
          interaction.user,
          member.user,
          "-"
        );
        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "delete") {
        const delWarnData = await warnsRepository.getWarn(
          warnId,
          interaction.guild.id,
          member.user.id
        );

        if (!delWarnData) {
          interaction.reply(
            `Kein Warn mit ID: ${warnId} bei ${member} gefunden!`
          );
          return resolve(null);
        }

        const delWarnembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
          .setDescription(`Warn von ${member} entfernt!`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .addFields([
            {
              name: `Gelöschte Verwarnung:`,
              value: `Grund: ${delWarnData.warnReason}\nGewarnt von: ${delWarnData.warnModName}\n`,
              inline: false,
            },
          ])
          .addFields([
            {
              name: `Gelöscht von Moderator:`,
              value: `${interaction.user.tag}`,
              inline: false,
            },
          ]);

        await warnsRepository.delWarn(
          warnId,
          interaction.guild.id,
          member.user.id
        );

        const guildSettings = await guildSettingsRepository.getGuildSettings(
          interaction.guild,
          1
        );
        if (!guildSettings) {
        } else {
          const modLogChannel = guildSettings.modLog;
          client.channels.cache
            .get(modLogChannel)
            .send({ embeds: [delWarnembed] });
        }
        interaction.reply({ embeds: [delWarnembed] });
        setTimeout(function () {
          interaction.deleteReply();
        }, 5000);

        // ############## LOGGING ############## \\
        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "warns delete",
          interaction.user,
          member.user,
          "-"
        );
        // ############## LOGGING END ############## \\
        return resolve(null);
      }
      if (interaction.options.getSubcommand() === "clearall") {
        if (warns.length === 0) {
          interaction.reply(
            `${member} hat keine Verwarnungen die gelöscht werden können!`
          );
          return resolve(null);
        }

        var warnsText = "";
        warns.forEach((warn) => {
          const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
          const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const spacer = `\u00A0\u00A0\u00A0\u00A0`;
          warnsText += `ID: ${warn.ID} • GRUND: ${warn.warnReason} • MOD: ${warn.warnModName}\n`;
        });

        const delWarnsembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
          .setDescription(`Alle Warns von ${member} entfernt!`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .addFields([
            {
              name: `Gelöscht von Moderator:`,
              value: `${interaction.user.tag}`,
              inline: false,
            },
          ])
          .addFields([
            {
              name: `Gelöschte Verwarnungen:`,
              value: `${warnsText}`,
              inline: false,
            },
          ]);

        await warnsRepository.delAllWarns(interaction.guild.id, member.user.id);

        const guildSettings = await guildSettingsRepository.getGuildSettings(
          interaction.guild,
          1
        );
        if (!guildSettings) {
        } else {
          const modLogChannel = guildSettings.modLog;
          client.channels.cache
            .get(modLogChannel)
            .send({ embeds: [delWarnsembed] });
        }
        interaction.reply({ embeds: [delWarnsembed] });
        setTimeout(function () {
          interaction.deleteReply();
        }, 5000);

        // ############## LOGGING ############## \\
        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "warns clearall",
          interaction.user,
          member.user,
          "-"
        );
        // ############## LOGGING END ############## \\
        return resolve(null);
      }
    });
  },
};
