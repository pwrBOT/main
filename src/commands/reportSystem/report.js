const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const guildsRepository = require("../../mysql/guildsRepository");

module.exports = {
  name: "report",
  category: "moderation",
  description:
    "User können andere User melden. Nachricht kommt in den Bot-Log Channel, sofern definiert --> Bot Setup ",
  data: new SlashCommandBuilder()
    .setName(`report`)
    .setDescription(`User melden!`)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User der gemeldet werden soll")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      const { options } = interaction;
      const member = options.getMember("user");

      if (!member) {
        interaction.reply({
          content: "❌ Der User ist nicht mehr auf dem Server ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      if (interaction.guild.ownerId === member.id) {
        interaction.reply({
          content: "❌ Du kannst den Serverinhaber nicht reporten! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const teamRoleId = await guildsRepository.getGuildSetting(
        interaction.guild,
        "teamRole"
      );

      try {
        if (member.roles.cache.has(teamRoleId.value)) {
          interaction.reply({
            content: "❌ Du kannst niemanden aus dem Team reporten! ❌",
            ephemeral: true
          });
          return resolve(null);
        }
      } catch (error) {}

      if (member.id === client.user.id) {
        interaction.reply({
          content: "❌ Du kannst den Bot nicht reporten! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const modal = new ModalBuilder()
        .setCustomId("userReport")
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

      const reportedUserId = new TextInputBuilder()
        .setCustomId("reportedUserId")
        .setLabel("ID des Users der gemeldet wird:")
        .setValue(`${member.user.id}`)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(textInput),
        new ActionRowBuilder().addComponents(reportedUserInput),
        new ActionRowBuilder().addComponents(reportedUserId)
      );

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "report/slashcommand",
        interaction.user,
        "-",
        "-"
      );

      await interaction.showModal(modal);
    });
  }
};
