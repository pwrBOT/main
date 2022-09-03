const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");
const tempChannels = require("../../mysql/tempChannels");

module.exports = {
  name: "Temp-Voicechannel",
  category: "admintools",
  description: "Verwalte Temp-Voice-Channels",
  data: new SlashCommandBuilder()
    .setName(`TempVoiceChannel`)
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
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("permission")
            .setDescription("Soll der User Mod-Rechte in seinem erstellen Channel bekommen?")
            .addChoices(
              { name: "Ja", value: "yes" },
              { name: "Nein", value: "no" }
            )
            .setRequired(true)
        ),
    ),
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const voiceChannel = interaction.options.getChannel("voicechannel");
      const permission = interaction.options.getString("permission");

      console.log(voiceChannel)
      if (voiceChannel.type === 'voice'){
        console.log("Ich bin ein Voice Channel")
        return resolve(null);
      }

      await tempChannels.addWarn(interaction.guild.id, voiceChannel.id, permission);
      
      return resolve(null);
    })
  }
}