const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
module.exports = {
  data: {
    name: `report_abgelehnt`
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const guildSettings = require("../../mysql/guildsRepository");
      const modRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modRole"
      );
      if (!modRoleId) {
        interaction.reply({
          ephemeral: true,
          content: "❌ Keine Moderator-Rolle definiert! ❌"
        });
        return resolve(null);
      }

      let isModerator = false;

      const modRoleIds = JSON.parse(modRoleId.value);
      modRoleIds.forEach((modRoleId) => {
        if (interaction.member.roles.cache.has(modRoleId)) {
          isModerator = true;
        }
      });

      if (!isModerator) {
        interaction.reply({
          ephemeral: true,
          content: "❌ Du bist kein Moderator! ❌"
        });
        return resolve(null);
      }

      const reportId = await interaction.message.embeds[0].description.split(
        "#"
      )[1];

      const modal = new ModalBuilder()
        .setCustomId("userReportAbgelehnt")
        .setTitle(`Report ${reportId} ablehnen!`);

      const modMessageInput = new TextInputBuilder()
        .setCustomId("modMessage")
        .setLabel("Ablehngrund:")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const reportIdInput = new TextInputBuilder()
        .setCustomId("reportId")
        .setLabel("Report-ID (nicht ändern):")
        .setValue(`${reportId}`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(modMessageInput),
        new ActionRowBuilder().addComponents(reportIdInput)
      );

      await interaction.showModal(modal);

      return resolve(null);
    });
  }
};
