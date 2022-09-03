const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Get Avatar")
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: `${interaction.targetUser.displayAvatarURL()}`,
    });
  },
};
