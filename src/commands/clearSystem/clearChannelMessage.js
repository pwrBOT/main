const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Clear Channel")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction, client) {
    const { options, channel } = interaction;

    const messages = await channel.messages.fetch();

    const responseembed = new EmbedBuilder()
      .setColor(0x51ff00)
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `powered by Powerbot`
      });

    await channel
      .bulkDelete(100, true)
      .catch((error) => {
        try {
          responseembed.setDescription(
            `Keine Nachrichten gelöscht. Der Bot hat zu wenig Power ❌`
          );
          interaction.reply({ embeds: [responseembed] });
          setTimeout(function () {
            interaction.deleteReply().catch((error) => {});
          }, 5000);
        } catch (error) {}
      })
      .then(async (messages) => {
        try {
          responseembed.setDescription(
            `${messages.size} Nachrichten gelöscht ✅`
          );
          await interaction.reply({ embeds: [responseembed] });
          setTimeout(function () {
            interaction.deleteReply().catch((error) => {});
          }, 5000);
        } catch (error) {}
      });

    const commandLogRepository = require("../../mysql/commandLogRepository");
    // guild - command, user, affectedMember, reason
    await commandLogRepository.logCommandUse(
      interaction.guild,
      "clear",
      interaction.user,
      "-",
      "-"
    );
  }
};
