const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: {
    name: `nicknameChange_decline`
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageNicknames
        )
      ) {
        await interaction.editReply({
          content: `Du hast zu wenig Moderationsrechte um die Nickname-Änderungsanfrage zu bearbeiten!`,
          ephemeral: true
        });
        return resolve(null);
      }

      const embed = await interaction.message.embeds[0];
      const newNickname = await embed.fields[1].value;
      const memberId = await embed.fields[2].value;
      const member = await interaction.guild.members.fetch(memberId);
      const oldNickname = member.displayName;
      let failed = false;

      await member
        .setNickname(
          newNickname,
          `Wunsch des Users | Mod: ${interaction.member.displayName}`
        )
        .catch(async (error) => {
          failed = true;
        });

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("nicknameChange_decline")
        .setLabel(
          `Nickname Änderungswunsch von ${interaction.member.displayName} abgelehnt`
        )
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents([buttonErledigt])]
      });

      await interaction.editReply({
        content: `Der Nickname-Änderungswunsch von ${oldNickname} zu ${newNickname} wurde abgelehnt.`,
        ephemeral: true
      });

      const userEmbed = new EmbedBuilder()
        .setTitle(`❌ Nickname Änderungswunsch abgelehnt`)
        .setDescription(
          `Dein Nickname Änderungswunsch bei ${member.guild} wurde von einem Moderator abgelehnt.`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Aktueller Nickname:`,
            value: oldNickname,
            inline: true
          },
          {
            name: `Abgelehnter Wunsch-Nickname:`,
            value: newNickname,
            inline: true
          }
        ]);

      await member.send({ embeds: [userEmbed] }).catch((error) => {});

      return resolve(null);
    });
  }
};
