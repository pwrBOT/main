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
    name: `event_delete`
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

      const eventData = await eventRepository.eventGet(eventId, guild.id);

      if (member.id == eventData.host) {
      } else if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
      ) {
        interaction.editReply(
          "❌ Du bist nicht berechtigt, das Event zu beenden! ❌"
        );
        return resolve(null);
      }

      await eventRepository.eventUpdate(eventId, "eventStatus", "ended");

      // BUTTONS
      const buttonSubscribeHidden = new ButtonBuilder()
        .setCustomId("event_subscribe")
        .setLabel(`✅`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const buttonTentativeHidden = new ButtonBuilder()
        .setCustomId("event_tentative")
        .setLabel(`❔`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const buttonUnsubscribeHidden = new ButtonBuilder()
        .setCustomId("event_unsubscribe")
        .setLabel(`❌`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const buttonReactivate = new ButtonBuilder()
        .setCustomId("event_reactivate")
        .setLabel(`🔄`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false);

      const newEmbed = new EmbedBuilder()
        .setTitle(`${embed.title} [Event beendet]`)
        .setDescription(embed.description)
        .setColor(embed.color)
        .setFooter(embed.footer)
        .addFields(embed.fields);

      if (embed.image) {
        newEmbed.setImage(embed.image.url);
      }

      await message.edit({
        embeds: [newEmbed],
        components: [
          new ActionRowBuilder().addComponents([
            buttonSubscribeHidden,
            buttonTentativeHidden,
            buttonUnsubscribeHidden,
            buttonReactivate
          ])
        ]
      });

      interaction.editReply("🗑 Event erfolgreich wurde beendet");

      return resolve(null);
    });
  }
};
