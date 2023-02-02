const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const eventRepository = require("../../mysql/eventRepository");
var crypto = require("crypto");

module.exports = {
  name: "event",
  category: "moderation",
  description: "User vom Discord bannen",
  data: new SlashCommandBuilder()
    .setName(`event`)
    .setDescription(`Event-Verwaltung`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addSubcommand(subcommand =>
      subcommand
        .setName(`create`)
        .setDescription(`Event erstellen`)
        .addStringOption(option =>
          option
            .setName("eventtitle")
            .setDescription("Gib einen Eventnamen ein")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("eventdescription")
            .setDescription("Gib eine Beschreibung für dein Event ein")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("eventstart")
            .setDescription(
              "Wann soll dein Event starten? (Bsp.: 18 Mar 2025 15:00"
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("eventend")
            .setDescription(
              "Wann soll dein Event enden? (Bsp.: 18 Mar 2025 15:00"
            )
            .setRequired(true)
        )
        .addChannelOption(option =>
          option
            .setName("eventchannel")
            .setDescription("Wo soll die Ankündigung gepostet werden?")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addAttachmentOption(option =>
          option
            .setName("eventbild")
            .setDescription("Eventbild auswählen")
            .setRequired(false)
        )
        .addRoleOption(option =>
          option
            .setName("rollenerwaehnung")
            .setDescription("Rolle auswählen, die gepingt wird")
            .setRequired(false)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const { options, user, guild } = interaction;
      const eventTitle = options.getString("eventtitle");
      const eventDescription = options.getString("eventdescription");
      const eventStart = new Date(options.getString("eventstart"));
      const eventEnd = new Date(options.getString("eventend"));
      const eventChannel = options.getChannel("eventchannel");
      const eventBild = options.getAttachment("eventbild");
      const eventId = crypto.randomBytes(3).toString('hex');
      const pingRole = options.getRole("rollenerwaehnung");
      const host = user.id;

      if (eventBild) {
        if (!["jpg", "png", "gif"].some(url => eventBild.url.includes(url))) {
          interaction.editReply(
            `❌ Die hochgeladene Datei ist keine JPG / PNG / GIF`
          );
          return resolve(null);
        }
      }

      if (options.getSubcommand() === "create") {
        if (eventStart == "Invalid Date" || eventEnd == "Invalid Date") {
          interaction.editReply(`❌ Kein gültiges Datum eingegeben`);
          return resolve(null);
        }

        // DEFINE EMBED
        const eventEmbed = new EmbedBuilder()
          .setTitle(`${eventTitle}`)
          .setDescription(
            `${eventDescription}\n\n**Zeit:**\n<t:${Date.parse(eventStart) /
              1000 -
              3600}:F> - <t:${Date.parse(eventEnd) / 1000 -
              3600}:F>\n⏱ <t:${Date.parse(eventStart) / 1000 - 3600}:R>\n\n`
          )
          .setColor(0x03b6fc)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot | Event ID: #${eventId}`
          })
          .addFields(
            { name: `✅ Zugesagt:`, value: `> \u200B`, inline: true },
            { name: `❔ Interessiert:`, value: `> \u200B`, inline: true },
            { name: `❌ Abgesagt:`, value: `> \u200B`, inline: true }
          );

        if (eventBild) {
          eventEmbed.setImage(eventBild.url);
        }

        const buttonSubscribe = new ButtonBuilder()
          .setCustomId("event_subscribe")
          .setLabel(`✅`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(false);

        const buttonTentative = new ButtonBuilder()
          .setCustomId("event_tentative")
          .setLabel(`❔`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(false);

        const buttonUnsubscribe = new ButtonBuilder()
          .setCustomId("event_unsubscribe")
          .setLabel(`❌`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(false);

        const buttonDelete = new ButtonBuilder()
          .setCustomId("event_delete")
          .setLabel(`🗑`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(false);

        // SEND MESSAGE
        interaction.editReply({
          content: `Event (ID: #${eventId}) wurde angelegt und in ${eventChannel} veröffentlicht`,
          embeds: [eventEmbed]
        });

        let eventPosting = "";

        if (pingRole) {
          eventPosting = await eventChannel.send({
            content: `${pingRole}`,
            embeds: [eventEmbed],
            components: [
              new ActionRowBuilder().addComponents([
                buttonSubscribe,
                buttonTentative,
                buttonUnsubscribe,
                buttonDelete
              ])
            ]
          });
        } else {
          eventPosting = await eventChannel.send({
            embeds: [eventEmbed],
            components: [
              new ActionRowBuilder().addComponents([
                buttonSubscribe,
                buttonTentative,
                buttonUnsubscribe,
                buttonDelete
              ])
            ]
          });
        }

        await eventRepository.eventAdd(
          eventId,
          guild.id,
          eventChannel.id,
          eventPosting.id,
          host,
          eventTitle,
          eventDescription,
          eventStart,
          eventEnd
        );
      }

      // ############################ COMMAND LOGGING ############################ \\
      /** 
      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "event create",
        interaction.user,
        member.user,
        reason
      );
      */

      return resolve(null);
    });
  }
};
