const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");


module.exports = {
  name: "report",
  category: "moderation",
  description: "User können andere User melden. Nachricht kommt in den Bot-Log Channel, sofern definiert --> Bot Setup ",
  data: new SlashCommandBuilder()
    .setName(`report`)
    .setDescription(`User melden!`)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User der gemeldet werden soll")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const { options } = interaction;
    const member = options.getMember("user");

    const modal = new ModalBuilder()
      .setCustomId("userReportSlashCommand")
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
      new ActionRowBuilder().addComponents(textInput),
      new ActionRowBuilder().addComponents(reportedUserInput)
    );

    const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
    await commandLogRepository.logCommandUse(interaction.guild, "report", interaction.user, "-", "-")

    await interaction.showModal(modal);
  },
};
