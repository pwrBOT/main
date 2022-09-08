const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Clear Channel")
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {

    const {options, channel } = interaction;

    const amount = options.getNumber("amount");
    const messages = await channel.messages.fetch();

    const responseembed = new EmbedBuilder()
    .setColor(0x51ff00)
    .setTimestamp(Date.now())
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `powered by Powerbot`,
    });

    await channel.bulkDelete(amount, true).then(messages => {
      responseembed.setDescription(`${messages.size} Nachrichten gelöscht ✅`);
      interaction.reply({embeds: [responseembed]});
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);
  })

  const commandLogRepository = require("../../mysql/commandLogRepository");
                                        // guild - command, user, affectedMember, reason
  await commandLogRepository.logCommandUse(interaction.guild, "clear", interaction.user, "-", "-")
  },
};
