const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require(`discord.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`help`)
    .setDescription(`Hilfestellungen!`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const button = new ButtonBuilder()
      .setCustomId("wiki")
      .setLabel("Wiki öffnen")
      .setStyle(ButtonStyle.Primary);

    await interaction.reply({
      components: [new ActionRowBuilder().addComponents(button)],
    });
  },
};
