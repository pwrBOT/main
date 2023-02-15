const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require(`discord.js`);

module.exports = {
  name: "clear",
  category: "moderation",
  description: "Nachrichten mit dem Bot löschen",
  data: new SlashCommandBuilder()
    .setName(`clear`)
    .setDescription(`Nachrichten löschen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addNumberOption(option =>
      option
        .setName("amount")
        .setDescription(
          "Anzahl der Nachrichten die gelöscht werden sollen (max. 100)"
        )
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const { options, channel } = interaction;

    const amount = options.getNumber("amount");

    if (amount > 100)
      return interaction
        .reply("❌ Du kannst nur maximal 100 Nachrichten auf einmal löschen ❌")
        .then(
          setTimeout(function() {
            interaction.deleteReply();
          }, 3000)
        );

    const messages = await channel.messages.fetch();

    const responseembed = new EmbedBuilder()
      .setColor(0x51ff00)
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `powered by Powerbot`
      });

    try {
      await channel.bulkDelete(amount, true).then(messages => {
        responseembed.setDescription(`${messages.size} Nachrichten gelöscht ✅`);
        interaction.reply({ embeds: [responseembed] });
        try {
          setTimeout(function() {
            interaction.deleteReply();
          }, 5000);
        } catch (error) {}
      });
    } catch (error) {}

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
