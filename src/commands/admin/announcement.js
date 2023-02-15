const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

module.exports = {
  name: "Announcement",
  category: "admintools",
  description: "Eine Ankündigung schreiben",
  data: new SlashCommandBuilder()
    .setName(`ankuendigung`)
    .setDescription(`Ankuendigung per Bot schreiben`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel auswählen")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("erwaehnung")
        .setDescription("Soll @everyone gepingt werden?")
        .addChoices({ name: "Ja", value: "yes" }, { name: "Nein", value: "no" })
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("titel")
        .setDescription("Titel der Ankuendigung")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Text der Ankuendigung ($n = neue Zeile)")
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option
        .setName("titelbild")
        .setDescription("Titelbild auswählen")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });

      const { options, member, guild } = interaction;
      const newsChannel = options.getChannel("channel");
      const titel = options.getString("titel");
      const text = options.getString("text");
      const titelbild = options.getAttachment("titelbild");
      const erwaehnung = options.getString("erwaehnung");

      const announcement = new EmbedBuilder()
        .setAuthor({
          name: `${guild.name}`,
          iconURL: `${guild.iconURL()}`
        })
        .setTitle(titel)
        .setColor(0x0068f7)
        .setTimestamp(Date.now());

      if (titelbild) {
        const titelbildLink = titelbild.url;
        announcement.setImage(titelbildLink);
      }

      if (text) {
        announcement.setDescription(text.replaceAll("$n", "\n"))
      }

      if (erwaehnung == "yes") {
        await newsChannel
          .send({ content: `@everyone`, embeds: [announcement] })
          .catch(console.error);
      } else {
        await newsChannel.send({ embeds: [announcement] }).catch(console.error);
      }

      await interaction.editReply("Die Ankündigung wurde veröffentlicht");

      try {
        setTimeout(function() {
          interaction.deleteReply();
        }, 5000);
      } catch (error) {}

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "Announcement",
        interaction.user,
        member.user,
        "-"
      );

      return resolve(null);
    });
  }
};
