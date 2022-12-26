const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");

module.exports = {
  name: "Temp-Voicechannel",
  category: "admintools",
  description: "Verwalte Temp-Voice-Channels",
  data: new SlashCommandBuilder()
    .setName(`tempvoicechannel`)
    .setDescription(`Erstelle einen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`add`)
        .setDescription(`Erstelle einen Temp-Voice-Channel`)
        .addChannelOption((option) =>
          option
            .setName("voicechannel")
            .setDescription("Voice-Channel auswählen")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("channelname")
            .setDescription(
              "Wie soll der Channel heißen? '#username' wird dran gehängt!"
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channelcategory")
            .setDescription("Übergeordnete Kategorie auswählen")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("permission")
            .setDescription(
              "Soll der User Mod-Rechte in seinem erstellen Channel bekommen?"
            )
            .addChoices(
              { name: "Ja", value: "yes" },
              { name: "Nein", value: "no" }
            )
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });

      const voiceChannel = interaction.options.getChannel("voicechannel");
      const channelCategory = interaction.options.getChannel("channelcategory");
      const tempChannelName = interaction.options.getString("channelname");
      const permission = interaction.options.getString("permission");

      if (voiceChannel.type != 2) {
        interaction.editReply("Fehler | Der ausgewählte Channel ist kein Voice Channel!");
        return resolve(null);
      }

      if (channelCategory.type != "4")
      {
        interaction.editReply("Fehler | Die ausgewählte Kategorie ist ein Channel und keine Kategorie!");
        return resolve(null);
      }

      const activeVC = await tempChannelsRepository.getTempVoiceChannel(
        interaction.guild.id,
        voiceChannel.id,
        "master"
      );

      if (activeVC) {
        await tempChannelsRepository.updateTempVoiceChannel(
          tempChannelName,
          permission,
          channelCategory.id,
          interaction.guild.id,
          voiceChannel.id
        );
        interaction.editReply(
          `⚠️ Voice-Channel bereits angelegt. Einstellungen wurden geupdated!\n**Name:**  ${tempChannelName}\n**Channel-Kategorie:**  ${channelCategory}\n**Userberechtigung:**  ${permission}`
        );
        return resolve(null);
      }

      await tempChannelsRepository.addTempVoiceChannel(
        interaction.guild.id,
        voiceChannel.id,
        "master",
        tempChannelName,
        "MASTER CHANNEL",
        permission,
        channelCategory.id
      );
      interaction.editReply(
        `✅ Temp-Voice-Channel erfolgreich gespeichert\n**Name:**  ${tempChannelName}\n**Channel-Kategorie:**  ${channelCategory}\n**Userberechtigung:**  ${permission}`
      );

      return resolve(null);
    });
  }
};
