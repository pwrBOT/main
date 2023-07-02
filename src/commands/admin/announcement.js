const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const imgUpload = require("../../functions/fileUpload/imgUpload");

module.exports = {
  name: "Announcement",
  category: "admintools",
  description: "Eine Ankündigung schreiben",
  data: new SlashCommandBuilder()
    .setName(`ankuendigung`)
    .setDescription(`Ankuendigung per Bot schreiben`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel auswählen")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("erwaehnung")
        .setDescription("Soll @everyone gepingt werden?")
        .addChoices({ name: "Ja", value: "yes" }, { name: "Nein", value: "no" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("titel")
        .setDescription("Titel der Ankuendigung")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text der Ankuendigung ($n = neue Zeile)")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("titelbild")
        .setDescription("Titelbild auswählen")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
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
        announcement.setImage(titelbild.url);

        /** 
        const upload = await imgUpload.upload(titelbild.url);

        if (upload.success == true) {
          announcement.setImage(upload.link);
        } else {
          await interaction.reply({
            content: "Das Bild konnte aus einem unbestimmten Grund nicht hochgeladen werden. Die Ankündigung wurde nicht veröffentlicht!",
            ephemeral: true
          });
          return resolve(null)
        }
        */
      }

      if (text) {
        announcement.setDescription(text.replaceAll("$n", "\n"));
      }

      if (erwaehnung == "yes") {
        await newsChannel
          .send({ content: `@everyone`, embeds: [announcement] })
          .catch(console.error);
      } else {
        await newsChannel.send({ embeds: [announcement] }).catch(console.error);
      }

      await interaction.reply({
        content: "Die Ankündigung wurde veröffentlicht",
        ephemeral: true
      });

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
