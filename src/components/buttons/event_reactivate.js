const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const eventRepository = require("../../mysql/eventRepository");

module.exports = {
  data: {
    name: `event_reactivate`
  },
  async execute(interaction) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const { guild, member, message } = interaction;
      const embed = await message.embeds[0];
      const eventId = await embed.footer.text.split("#")[1];

      const eventData = await eventRepository.eventGet(eventId);

      if (member.id == eventData.host) {
      } else if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
      ) {
        interaction.editReply(
          "❌ Du bist nicht berechtigt, das Event zu beenden! ❌"
        );
        return resolve(null);
      }

      if (eventData.eventEnd < new Date(Date.now())) {
        interaction.editReply(
          "❌ Die Endzeit wurde bereits erreicht. ❌"
        );
        return resolve(null);
      }

      await eventRepository.eventUpdate(eventId, "eventStatus", "active");

      // BUTTONS
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

        const embedTitle = embed.title

      const newEmbed = new EmbedBuilder()
        .setTitle(`${embedTitle.replaceAll("[Event beendet]", "")}`)
        .setDescription(embed.description)
        .setColor(embed.color)
        .setFooter(embed.footer)
        .addFields(embed.fields
        );

      if (embed.image) {
        newEmbed.setImage(embed.image.url);
      }

      await message.edit({
        embeds: [newEmbed],
        components: [
          new ActionRowBuilder().addComponents([
            buttonSubscribe,
            buttonTentative,
            buttonUnsubscribe,
            buttonDelete
          ])
        ]
      });

      interaction.editReply("🗑 Event erfolgreich wurde reactiviert");

      return resolve(null);
    });
  }
};
