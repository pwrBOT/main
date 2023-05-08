module.exports = {
  data: {
    name: `selectmenu_test`
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.reply({
        content: `Du hast ${interaction.values[0]} ausgewählt`,
        ephemeral: true
      });

      await interaction.message.delete();
    });
  }
};
