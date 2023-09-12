const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder
} = require(`discord.js`);
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const welcomeBanner = require("../../functions/userManagement/welcomeBanner");
const loggingHandler = require("../../functions/fileLogging/loggingHandler");
const embedsRepository = require("../../mysql/embedsRepository");

module.exports = {
  name: "generate_welcomebanner",
  category: "admin",
  description: "Welcome-Banner eines Users generieren.",
  data: new SlashCommandBuilder()
    .setName(`generate_welcomebanner`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User von dem der Welcome-Banner generiert werden soll")
        .setRequired(true)
    )
    .setDescription(`Welcome-Banner eines Users generieren.`),

  async execute(interaction) {
    return new Promise(async (resolve) => {
      const member = interaction.options.getMember("user");

      if (member.user.bot === true) {
        await interaction.reply({
          content: "Ein Bot hat keinen Welcome-Banner!",
          ephemeral: true
        });
        return resolve(null);
      }

      const getUser = await usersRepository.getUser(
        member.user.id,
        member.guild.id
      );

      if (!getUser) {
        const logText = `[MYSQL DATABASE] UserId: ${member.user.id} bei Guild: ${member.guild.id} nicht gefunden. User wird angelegt...`;
        loggingHandler.log(logText, "memberAdd");

        await usersRepository.addUser(member.guild.id, member.user);
        const welcomeMessage = "Herzlich Willkommen";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        await sendWelcomeMessage(member);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "generate_welcomebanner",
          interaction.user,
          "-",
          "-"
        );

        await interaction.reply({
          content: "Der Welcome-Banner wurde erfolgreich generiert!",
          ephemeral: true
        });

        return resolve(null);
        // ###################################################################################################### \\
      } else {
        const welcomeMessage = "Willkommen zurück";
        await welcomeBanner.createWelcomeBanner(member, welcomeMessage);

        await sendWelcomeMessage(member);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "generate_welcomebanner",
          interaction.user,
          "-",
          "-"
        );

        await interaction.reply({
          content: "Der Welcome-Banner wurde erfolgreich generiert!",
          ephemeral: true
        });
        return resolve(null);
      }
    });
  }
};

const sendWelcomeMessage = async (member) => {
  setTimeout(async function () {
    const welcomeEmbedData = await embedsRepository.getEmbed(
      member.guild,
      "welcomeMessage"
    );

    if (welcomeEmbedData) {
      if (welcomeEmbedData.dm == 1) {
        if (welcomeEmbedData.messageContent) {
          const welcomeMessageData = await JSON.parse(
            welcomeEmbedData.messageContent
          );

          const welcomeEmbed = new EmbedBuilder(welcomeMessageData.embed);
          let welcomeContent = "";

          try {
            if (welcomeMessageData.content) {
              welcomeContent = welcomeMessageData.content;
            }
          } catch (error) {}

          welcomeEmbed
            .setThumbnail(member.guild.iconURL())
            .setTimestamp(Date.now());

          try {
            member
              .send({
                embeds: [welcomeEmbed],
                content: welcomeContent
              })
              .catch((error) => {});
          } catch (error) {}
        }
      }
    }
  }, 5000);
};
