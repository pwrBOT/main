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
const { v4: uuidv4 } = require("uuid");

module.exports = {
  name: "event",
  category: "moderation",
  description: "User vom Discord bannen",
  data: new SlashCommandBuilder()
    .setName(`event`)
    .setDescription(`Event-Verwaltung`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`create`)
        .setDescription(`Event erstellen`)
        .addStringOption((option) =>
          option
            .setName("eventtitle")
            .setDescription("Gib einen Eventnamen ein")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("eventdescription")
            .setDescription("Gib eine Beschreibung für dein Event ein")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("eventstart")
            .setDescription(
              "Wann soll dein Event starten? (Bsp.: 18 Mar 2025 15:00"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("eventend")
            .setDescription(
              "Wann soll dein Event enden? (Bsp.: 18 Mar 2025 15:00"
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("eventchannel")
            .setDescription("Wo soll die Ankündigung gepostet werden?")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("maxsubscribers")
            .setDescription(
              "Event auf eine maximale Teilnehmeranzahl begrenzen."
            )
            .setRequired(false)
        )
        .addAttachmentOption((option) =>
          option
            .setName("eventbild")
            .setDescription("Eventbild auswählen")
            .setRequired(false)
        )
        .addRoleOption((option) =>
          option
            .setName("rollenerwaehnung")
            .setDescription("Rolle auswählen, die gepingt wird")
            .setRequired(false)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const { options, user, guild } = interaction;
      const eventTitle = options.getString("eventtitle");
      const eventDescription = options.getString("eventdescription");
      let maxSubscribers = options.getInteger("maxsubscribers");
      const eventStart = new Date(options.getString("eventstart"));
      const eventEnd = new Date(options.getString("eventend"));
      const eventChannel = options.getChannel("eventchannel");
      const eventBild = options.getAttachment("eventbild");
      const eventId = uuidv4();
      const pingRole = options.getRole("rollenerwaehnung");
      const host = user.id;

      if (maxSubscribers == null) maxSubscribers = -1;

      if (eventBild) {
        if (!["jpg", "png", "gif"].some((url) => eventBild.url.includes(url))) {
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

        const eventStartTime = Date.parse(eventStart) / 1000 - 7200;
        const eventEndTime = Date.parse(eventEnd) / 1000 - 7200;

        // DEFINE EMBED
        const eventEmbed = new EmbedBuilder()
          .setTitle(`${eventTitle}`)
          .setDescription(
            `${eventDescription}\n\n**Zeit:**\n<t:${eventStartTime}:F> - <t:${eventEndTime}:F>\n⏱ <t:${eventStartTime}:R>\n\n`
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

          if (maxSubscribers >= 1){
            eventEmbed.setDescription(
              `${eventDescription}\n\n**Zeit:**\n<t:${eventStartTime}:F> - <t:${eventEndTime}:F>\n⏱ <t:${eventStartTime}:R>\n\n**Maximale Teilnehmeranzahl:** ${maxSubscribers}\n\n`
            )
          }

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
          content: `Event wurde angelegt und in ${eventChannel} veröffentlicht.\nID: #${eventId} `,
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
          maxSubscribers,
          eventStart,
          eventEnd
        );
      }

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, 
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "event create",
        interaction.user,
        interaction.member.user,
        "-"
      );

      return resolve(null);
    });
  }
};
