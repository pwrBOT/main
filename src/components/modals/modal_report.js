const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");
const { Generator } = require("randomly-id-generator");

module.exports = {
  data: {
    name: "userReport"
  },

  async execute(interaction, client) {
    return new Promise(async resolve => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });
      const memberName = interaction.fields.getTextInputValue(
        "reportedUserInput"
      );
      const memberId = interaction.fields.getTextInputValue("reportedUserId");
      const member = client.users.cache.get(memberId);
      const reporterId = interaction.member.id;
      const reporter = interaction.member;
      const reason = interaction.fields.getTextInputValue("reportUserInput");
      const reportId = new Generator().generate();

      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.addReport(
        interaction,
        reporterId,
        memberId,
        reason,
        "open",
        "-",
        reportId
      );

      const allUserReports = await reportRepository.getAllUserReports(
        interaction.guild.id,
        memberId
      );

      let allUserReportsCount = "";

      if (allUserReports) {
        allUserReportsCount = allUserReports.length;
      } else {
        allUserReportsCount = "0";
      }


      const reportembedBase1 = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot ⚡️ | Report`)
        .setDescription(
          `User: ${member} wurde soeben gemeldet.\nReport ID: #${reportId}`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`
        });

      const buttonUebernehmen = new ButtonBuilder()
        .setCustomId("report_uebernahme")
        .setLabel("Report übernehmen")
        .setStyle(ButtonStyle.Success);

        const buttonAbgelehnt = new ButtonBuilder()
        .setCustomId("report_abgelehnt")
        .setLabel("Report ablehnen")
        .setStyle(ButtonStyle.Danger);

      await interaction.editReply(
        `Danke für Deine Meldung! User ${member} wurde den Moderatoren gemeldet ✅`
      );

      const data = await guildsRepository.getGuildSetting(
        interaction.guild,
        "modLog"
      );

      if (!data) {
        return resolve(null);
      } else {
        const modLogChannelId = data.value;

        if (modLogChannelId === undefined) {
          return resolve(null);
        } else {
          const reportembed = reportembedBase1.addFields([
            {
              name: `Beschwerde:`,
              value: `${reason}`,
              inline: false
            },
            {
              name: `Bisherige Reports:`,
              value: `${member.username} wurde bisher\n${allUserReportsCount} mal gemeldet.`,
              inline: true
            },
            {
              name: `Beschwerdeführer:`,
              value: `${reporter}`,
              inline: true
            }
          ]);
          const modLogChannel = await client.channels.cache.get(
            modLogChannelId
          );

          modLogChannel
            .send({
              embeds: [reportembed],
              components: [
                new ActionRowBuilder().addComponents([
                  buttonUebernehmen,
                  buttonAbgelehnt
                ])
              ]
            })
            .catch(console.error);

          const modRoleId = await guildsRepository.getGuildSetting(
            interaction.guild,
            "modRole"
          );

          if (!modRoleId) {
            return resolve(null);
          }

          const modRoleIds = JSON.parse(modRoleId.value);
          modRoleIds.forEach(modRoleId => {
            modLogChannel
              .send(`${interaction.guild.roles.cache.get(modRoleId)}`)
              .then(msg => {
                msg.delete({ timeout: 500 });
              });
          });
        }
      }
      return resolve(null);
    });
  }
};
