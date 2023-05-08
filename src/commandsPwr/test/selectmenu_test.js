const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder
} = require(`discord.js`);

module.exports = {
  name: "selectmenu_test",
  category: "test",
  description: "Select Menü Test",
  data: new SlashCommandBuilder()
    .setName(`selectmenu_test`)
    .setDescription(`Select Menü Test`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const selectmenu_test = new StringSelectMenuBuilder()
      .setCustomId(`selectmenu_test`)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          label: `Option 1`,
          value: `Test 1`
        }),
        new StringSelectMenuOptionBuilder({
          label: `Option 2`,
          value: `Test 2`
        })
      );

    await interaction.reply({
      components: [new ActionRowBuilder().addComponents(selectmenu_test)]
    });
  }
};
