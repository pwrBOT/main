const { SlashCommandBuilder } = require(`discord.js`);
const canvasWelcome = require("../../components/canvas/canvasWelcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`userbanner`)
    .setDescription(`Userbanner anzeigen`),

  async execute(interaction) {
    const img = await canvasWelcome.generateImage(interaction, interaction.user, interaction.guild);

    if (!img) {
      return interaction.reply("❌");
    }

    interaction.reply({ files: [img] });

    const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
    await commandLogRepository.logCommandUse(interaction.guild, "userbanner", interaction.user, "-", "-")
  },
};
