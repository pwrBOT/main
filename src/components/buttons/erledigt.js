const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: {
    name: `erledigt`
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const buttonErledigt = new ButtonBuilder()
        .setCustomId("erledigt")
        .setLabel(`Erledigt durch ${interaction.member.displayName}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents([buttonErledigt])]
      });

      interaction.deferUpdate().then().catch();

      return resolve(null);
    });
  }
};
