const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
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
        .addStringOption((option) =>
          option
            .setName("delreason")
            .setDescription("Begründung (max. 60 Zeichen)")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`clearall`)
        .setDescription(`Alle Warns eines Users löschen`)
        .addUserOption((option) =>
          option.setName("user").setDescription("User").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("delreason")
            .setDescription("Begründung")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const member = interaction.options.getMember("user");
      const warns = await warnsRepository.getWarns(member, "active", 10);
      const delreason =
        interaction.options.getString("delreason") || "Kein Grund angegeben";

      if (interaction.options.getSubcommand() === "show") {
        if (!warns) {
          return resolve(null);
        }

        let warnsText = "";

        if (warns.length === 0) {
          warnsText = "Der User hat keine Verwarnungen 😊";
        } else {
          warns.forEach((warn) => {
            const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
            const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit"
            });
            const spacer = `\u00A0\u00A0\u00A0\u00A0`;
            warnsText += `ID: ${warn.ID} | ${date}  •  ${time}h:${spacer}${warn.warnReason}\n`;
          });
        }

        // GET OLD WARNS
        let oldWarnsText = "";
        let oldWarns = await warnsRepository.getWarns(member, "removed", 10);

        if (oldWarns.length === 0) {
          oldWarnsText = `Der User hat keine gelöschten Verwarnungen 😊`;
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
              value: `${interaction.user.username}`,
              inline: false
            }
          ]);
        await interaction.reply({ embeds: [warnsembed] });

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

        if (delreason.length > 60) {
          await interaction.reply({
            content: `Die Begründung darf max 60 Zeichen lang sein!`,
            ephemeral: true
          });
          return resolve(null);
        }

        const activeWarns = await warnsRepository.getWarns(
          member,
          "active",
          20
        );

        if (activeWarns.length === 0) {
          await interaction.reply({
            content: `Der User hat keine Verwarnungen!`,
            ephemeral: true
          });
          return resolve(null);
        }

        const sm_warns_del = new StringSelectMenuBuilder()
          .setCustomId(`sm_warns_del`)
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            new StringSelectMenuOptionBuilder({
              label: `Abbrechen`,
              value: `Abbrechen`
            })
          );

        for (const warn of activeWarns) {
          const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
          const spacer = `\u00A0\u00A0\u00A0\u00A0`;
          let reason = "";

          if (warn.warnReason.length > 10) {
            reason = warn.warnReason.slice(0, 10) + "...";
          } else {
            reason = warn.warnReason;
          }

          sm_warns_del.addOptions(
            new StringSelectMenuOptionBuilder({
              label: `ID: #${warn.ID} | ${date}  • ${warn.warnReason}`,
              value: `${warn.ID} | ${member.id} | ${delreason}`
            })
          );
        }

        await interaction.reply({
          components: [new ActionRowBuilder().addComponents(sm_warns_del)],
          ephemeral: true
        });

        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "clearall") {
        if (warns.length === 0) {
          await interaction.reply(
            `${member} hat keine Verwarnungen die gelöscht werden können!`
          );
          return resolve(null);
        }

        var warnsText = "";
        warns.forEach((warn) => {
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
              value: `${interaction.user.username}`,
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

        await warnsRepository.delAllWarns(
          interaction.guild.id,
          member.user.id,
          delreason
        );

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(interaction.guild, "modLog", delWarnsembed);
        await interaction.reply({ embeds: [delWarnsembed] });
        try {
          setTimeout(function () {
            interaction.deleteReply().catch((error) => {});
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
