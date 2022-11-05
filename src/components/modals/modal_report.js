const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "userReport",
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true,
      });
      const memberName =
        interaction.fields.getTextInputValue("reportedUserInput");
      const memberId = interaction.fields.getTextInputValue("reportedUserId");
      const member = client.users.cache.get(memberId);
      const reporter = interaction.member;
      const reason = interaction.fields.getTextInputValue("reportUserInput");

      const reportembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot ⚡️ | User Report`)
        .setDescription(`User: ${member} wurde soeben gemeldet.`)
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`,
        })
        .addFields([
          {
            name: `Beschwerde:`,
            value: `${reason}`,
            inline: false,
          },
          {
            name: `Beschwerdeführer:`,
            value: `${reporter}`,
            inline: true,
          },
        ]);

      await interaction.editReply(`Danke für Deine Meldung! User ${member} wurde den Moderatoren gemeldet ✅`);
      
      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", reportembed);

      return resolve(null);
    });
  },
};
