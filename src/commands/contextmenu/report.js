const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("User melden")
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
  async execute(interaction, client) {
    const { options } = interaction;
    const member = options.getMember("user");

    const modal = new ModalBuilder()
      .setCustomId("userReportContextmenu")
      .setTitle(`User ${member.user.tag} melden!`);

    const textInput = new TextInputBuilder()
      .setCustomId("reportUserInput")
      .setLabel("Warum möchtest du den User melden?")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const reportedUserInput = new TextInputBuilder()
      .setCustomId("reportedUserInput")
      .setLabel("User der gemeldet wird:")
      .setValue(`${member.user.tag}`)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder().addComponents(textInput)
    );

    const commandLogRepository = require("../../mysql/commandLogRepository");
    // guild - command, user, affectedMember, reason
    await commandLogRepository.logCommandUse(
      interaction.guild,
      "report",
      interaction.user,
      "-",
      "-"
    );

    await interaction.showModal(modal);
  },
};
