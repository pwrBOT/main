const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");
const reportRepository = require("../../mysql/reportRepository");

module.exports = {
  name: "reports get",
  category: "moderation",
  description: "Reports eines Users anzeigen oder löschen",
  data: new SlashCommandBuilder()
    .setName(`reports`)
    .setDescription(`Reports eines Users anzeigen oder löschen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName(`show`)
        .setDescription(`Reports eines Users anzeigen`)
        .addUserOption(option =>
          option.setName("user").setDescription("User").setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });

      const member = interaction.options.getMember("user");
      const reports = await reportRepository.getReports(interaction.guild.id, member.id, 5);

      if (interaction.options.getSubcommand() === "show") {
        if (!reports) {
          interaction.editReply({content: `${member.displayName} hat keine Reports!`, ephemeral: true})
          return resolve(null);
        }

        if (reports.length === 0) {
          interaction.editReply({content: `${member.displayName} hat keine Reports!`, ephemeral: true})
          return resolve(null);
        }

        const reportsEmbed = new EmbedBuilder()
          .setTitle(`⚡️ Report-System ⚡️`)
          .setDescription(`Übersicht der letzten Reports von ${member} (max. 5):`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })


        await reports.forEach(report => {
          const date = new Date(report.reportDate).toLocaleDateString("de-DE");
          const time = new Date(report.reportDate).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
          });

          reportsEmbed.addFields([
            {
              name: `Report vom ${date} - ${time}:`,
              value: `${report.reportReason}\nStatus: ${report.reportStatus}`,
              inline: false
            }
          ]);
        });

        reportsEmbed.addFields([
          {
            name: `Angefordert von:`,
            value: `${interaction.user.tag}`,
            inline: false
          }
        ]);

        interaction.editReply({ embeds: [reportsEmbed] });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "reports show",
          interaction.user,
          member.user,
          "-"
        );
        return resolve(null);
      }
    });
  }
};
