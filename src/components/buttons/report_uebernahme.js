const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: {
    name: `report_uebernahme`
  },
  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const guildSettings = require("../../mysql/guildsRepository");
      const modRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modRole"
      );

      if (!modRoleId) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Keine Moderator-Rolle definiert! ❌"
        });
        return resolve(null);
      }

      let isModerator = false;

      const modRoleIds = JSON.parse(modRoleId.value);
      modRoleIds.forEach(modRoleId => {
        if (interaction.member.roles.cache.has(modRoleId)) {
          isModerator = true;
        }
      });

      if (!isModerator) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Du bist kein Moderator! ❌"
        });
        return resolve(null);
      }

      const reportId = await interaction.message.embeds[0].description.split(
        "#"
      )[1];
      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.getReport(
        interaction.guild.id,
        reportId
      );
      await reportRepository.updateReport(
        interaction.guild.id,
        reportId,
        `Taken from ${interaction.user.tag}`,
        interaction.user.id,
        "-"
      );

      const buttonUebernahme = new ButtonBuilder()
        .setCustomId("report_uebernahme")
        .setLabel(`Report in Bearbeitung von ${interaction.member.displayName}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const buttonBearbeiten = new ButtonBuilder()
        .setCustomId("report_bearbeiten")
        .setLabel(`Report bearbeiten und Thread erstellen`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report als erledigt markieren`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      const buttonAbgelehnt = new ButtonBuilder()
        .setCustomId("report_abgelehnt")
        .setLabel("Report ablehnen")
        .setStyle(ButtonStyle.Danger);

      await interaction.message.edit({
        components: [
          new ActionRowBuilder().addComponents([
            buttonUebernahme,
            buttonBearbeiten,
            buttonErledigt,
            buttonAbgelehnt
          ])
        ]
      });

      const reportedUserId = await interaction.message.embeds[0].description
        .split("<@")[1]
        .split(">")[0];

      await interaction.editReply({
        ephemeral: true,
        content: `✅ Du hast den Report übernommen!\nBearbeite nun den Report oder nimm vorab mit dem Melder Kontakt auf um weitere Details abzufragen.`
      });
      return resolve(null);
    });
  }
};
