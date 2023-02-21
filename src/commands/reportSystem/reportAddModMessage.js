const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const guildSettings = require("../../mysql/guildsRepository");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Moderator Nachricht")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
  async execute(interaction, client) {
    return new Promise(async resolve => {

      interaction.reply({
        content: "❌ Hier passiert noch nichts :(",
        ephemeral: true
      });
      return resolve(null);
      
      /**
      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "reportAddModMessage/app",
        interaction.user,
        "-",
        "-"
      );
       */
    });
  }
};
