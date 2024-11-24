const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  data: {
    name: "userReport"
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });
      const memberName =
        interaction.fields.getTextInputValue("reportedUserInput");
      const memberId = interaction.fields.getTextInputValue("reportedUserId");
      const reporterId = interaction.member.id;
      const reporter = interaction.member;
      
      let reason = interaction.fields.getTextInputValue("reportUserInput");
      
      if (reason.length > 1023) {
        reason = reason.substring(0, 1015) + "...";

      } 

      const reportId = uuidv4();
      let member = "";
      try {
        member = await interaction.guild.members.fetch(memberId);
      } catch (error) {
        await interaction.editReply(
          `Danke für Deine Meldung! Der User ist mittlerweile nicht mehr Teil des Servers ✅`
        );
        return resolve(null);
      }

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
        .setTitle(`⚡️ Report System ⚡️`)
        .setDescription(
          `User: ${
            member.displayName
          } (${member}) wurde soeben gemeldet.\nReport ID: #${reportId.slice(
            -10
          )}`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0xff0000)
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

      const data = await guildsRepository.getGuildSetting(
        interaction.guild,
        "modLog"
      );

      if (!data) {
        await interaction.editReply(
          `Der Report konnte nicht an die Moderatoren übermittelt werden. Das System ist nicht vollständig eingerichtet. Bitte wende dich per Chat an das Team.`
        );
        return resolve(null);
      } else {
        const modLogChannelId = data.value;

        if (modLogChannelId === undefined) {
          await interaction.editReply(
            `Der Report konnte nicht an die Moderatoren übermittelt werden. Das System ist nicht vollständig eingerichtet. Bitte wende dich per Chat an das Team.`
          );
          return resolve(null);
        } else {
          await interaction.editReply(
            `Danke für Deine Meldung! User ${member} wurde den Moderatoren gemeldet ✅`
          );

          const reportembed = reportembedBase1.addFields([
            {
              name: `Beschwerde:`,
              value: `${reason}`,
              inline: false
            },
            {
              name: `Bisherige Reports:`,
              value: `${member.displayName} wurde bisher\n${allUserReportsCount} mal gemeldet.`,
              inline: true
            },
            {
              name: `Beschwerdeführer:`,
              value: `${reporter}`,
              inline: true
            }
          ]);
          const modLogChannel = await client.channels.fetch(modLogChannelId);

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
          modRoleIds.forEach((modRoleId) => {
            modLogChannel
              .send(`${interaction.guild.roles.cache.get(modRoleId)}`)
              .then((msg) => {
                msg.delete({ timeout: 500 });
              });
          });
        }
      }
      return resolve(null);
    });
  }
};
