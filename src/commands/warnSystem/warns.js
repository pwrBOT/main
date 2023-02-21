const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");
const warnsRepository = require("../../mysql/warnsRepository");

module.exports = {
  name: "warns",
  category: "warning",
  description: "Warns eines Users anzeigen oder löschen",
  data: new SlashCommandBuilder()
    .setName(`warns`)
    .setDescription(`Warns eines Users anzeigen oder löschen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName(`show`)
        .setDescription(`Warns eines Users anzeigen`)
        .addUserOption(option =>
          option.setName("user").setDescription("User").setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(`delete`)
        .setDescription(`Warn eines Users löschen`)
        .addUserOption(option =>
          option.setName("user").setDescription("User").setRequired(true)
        )
        .addNumberOption(option =>
          option.setName("id").setDescription("Warn ID").setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("delreason")
            .setDescription("Begründung")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(`clearall`)
        .setDescription(`Alle Warns eines Users löschen`)
        .addUserOption(option =>
          option.setName("user").setDescription("User").setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("delreason")
            .setDescription("Begründung")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      const member = interaction.options.getMember("user");
      const warnId = interaction.options.getNumber("id");
      const warns = await warnsRepository.getWarns(member, "active", 10);
      const delreason =
        interaction.options.getString("delreason") || "Kein Grund angegeben";

      if (interaction.options.getSubcommand() === "show") {
        if (!warns) {
          return resolve(null);
        }

        if (warns.length === 0) {
          interaction.reply(`${member.displayName} hat keine Verwarnungen!`);
          try {
            setTimeout(function() {
              interaction.deleteReply().catch(error => {});;
            }, 5000);
          } catch (error) {}
          return resolve(null);
        }

        var warnsText = "";
        warns.forEach(warn => {
          const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
          const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
          });
          const spacer = `\u00A0\u00A0\u00A0\u00A0`;
          warnsText += `ID: ${warn.ID} | ${date}  •  ${time}h:${spacer}${warn.warnReason}\n`;
        });

        // GET OLD WARNS
        let oldWarnsText = "";
        let oldWarns = await warnsRepository.getWarns(member, "removed", 10);

        if (!oldWarns) {
          return resolve(null);
        }

        if (oldWarns.length === 0) {
          oldWarnsText = `Der User hat keine gelöschten Verwarnungen!`;
        } else {
          oldWarns.forEach((oldWarn) => {
            const date = new Date(oldWarn.warnAdd).toLocaleDateString("de-DE");
            const time = new Date(oldWarn.warnAdd).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit"
            });
            const spacer = `\u00A0\u00A0\u00A0\u00A0`;
            oldWarnsText += `${date}\u00A0•\u00A0${time}h:${spacer}Warngrund: ${oldWarn.warnReason}\u00A0|\u00A0\nLöschgrund: ${oldWarn.delReason}\n\n`;
          });
        }

        const warnsembed = new EmbedBuilder()
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(`Warns-Übersicht von ${member}`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Letzten 10 Verwarnungen:`,
              value: `${warnsText}`,
              inline: false
            },
            {
              name: `Letzten 10 gelöschten Verwarnungen:`,
              value: `${oldWarnsText}`,
              inline: false
            }
          ])
          .addFields([
            {
              name: `Angefordert von:`,
              value: `${interaction.user.tag}`,
              inline: false
            }
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
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(`Warn von ${member} entfernt!`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Gelöschte Verwarnung:`,
              value: `Grund: ${delWarnData.warnReason}\nGewarnt von: ${delWarnData.warnModName}\n`,
              inline: false
            },
            {
              name: `Gelöscht von Moderator:`,
              value: `${interaction.user.tag}`,
              inline: true
            },
            {
              name: `Begründung:`,
              value: `${delreason}`,
              inline: true
            }
          ]);

        const delWarnembedUser = new EmbedBuilder()
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(`Ein Warn von dir wurde gelöscht!`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Gelöschte Verwarnung:`,
              value: `Grund: ${delWarnData.warnReason}\nGewarnt von: ${delWarnData.warnModName}\n`,
              inline: false
            },
            {
              name: `Gelöscht von Moderator:`,
              value: `${interaction.user.tag}`,
              inline: true
            },
            {
              name: `Begründung:`,
              value: `${delreason}`,
              inline: true
            }
          ]);

        await warnsRepository.delWarn(warnId, member.user.id, delreason);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(interaction.guild, "modLog", delWarnembed);
        interaction.reply({ embeds: [delWarnembed] });
        try {
          setTimeout(function() {
            interaction.deleteReply().catch(error => {});;
          }, 5000);
        } catch (error) {}

        try {
          member.send({ embeds: [delWarnembedUser] }).catch(error => {});
        } catch (error) {}

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
        warns.forEach(warn => {
          const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
          const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
          });
          const spacer = `\u00A0\u00A0\u00A0\u00A0`;
          warnsText += `ID: ${warn.ID} • GRUND: ${warn.warnReason} • MOD: ${warn.warnModName}\n`;
        });

        const delWarnsembed = new EmbedBuilder()
          .setTitle(`⚡️ Warning-System ⚡️`)
          .setDescription(`Alle Warns von ${member} entfernt!`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Gelöscht von Moderator:`,
              value: `${interaction.user.tag}`,
              inline: false
            },
            {
              name: `Gelöschte Verwarnungen:`,
              value: `${warnsText}`,
              inline: false
            },
            {
              name: `Begründung:`,
              value: `${delreason}`,
              inline: true
            }
          ]);

        await warnsRepository.delAllWarns(interaction.guild.id, member.user.id, delreason);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(interaction.guild, "modLog", delWarnsembed);
        interaction.reply({ embeds: [delWarnsembed] });
        try {
          setTimeout(function() {
            interaction.deleteReply().catch(error => {});;
          }, 5000);
        } catch (error) {}

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
  }
};
