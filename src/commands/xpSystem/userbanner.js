const { SlashCommandBuilder } = require(`discord.js`);
const anvasUserbanner = require("../../components/canvas/canvasUserbanner");

module.exports = {
  name: "userbanner",
  category: "info",
  description: "Banner mit eigenen Informationen generieren.",
  data: new SlashCommandBuilder()
    .setName(`userbanner`)
    .setDescription(`Userbanner anzeigen`),

  async execute(interaction) {
    const img = await anvasUserbanner.generateImage(interaction, interaction.user, interaction.guild, interaction.member);

    if (!img) {
      return interaction.reply(`❌ Kein Userbanner verfügbar! Möglicherweise hast du bisher noch keine Nachricht geschrieben! ❌`);
    }

    interaction.reply({ files: [img] });

    const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
    await commandLogRepository.logCommandUse(interaction.guild, "userbanner", interaction.user, "-", "-")
  },
};