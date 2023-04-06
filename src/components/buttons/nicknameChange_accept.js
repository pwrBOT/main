const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `nicknameChange_accept`
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const embed = await interaction.message.embeds[0];
      const newNickname = await embed.fields[1].value;
      const memberId = await embed.fields[2].value;
      const member = await interaction.guild.members.fetch(memberId);
      const oldNickname = member.displayName
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
        .setCustomId("nicknameChange_accept")
        .setLabel(`Nickname Änderungswunsch von ${interaction.member.displayName} akzeptiert`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

        const buttonNoPermissions = new ButtonBuilder()
        .setCustomId("nicknameChange_accept")
        .setLabel(`Nickname wurde nicht geändert. User kann nicht moderiert werden...!`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

        if (failed == true) {
          await interaction.editReply({
            content: `Der Nickname konnte aus einem unbekannten Grund nicht geändert werden.`,
            ephemeral: true
          });

          await interaction.message.edit({
            components: [new ActionRowBuilder().addComponents([buttonNoPermissions])]
          });
          return resolve(null);
        }

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents([buttonErledigt])]
      });

      await interaction.editReply({
        content: `Der Nickname wurde erfolgreich von ${oldNickname} zu ${newNickname} geändert`,
        ephemeral: true
      });

      const userEmbed = new EmbedBuilder()
        .setTitle(`✅ Nickname Änderungswunsch akzeptiert`)
        .setDescription(`Dein Nickname Änderungswunsch bei ${member.guild} wurde von einem Moderator bestätigt.`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Alter Nickname:`,
            value: oldNickname,
            inline: true
          },
          {
            name: `Neuer Nickname:`,
            value: newNickname,
            inline: true
          },
        ]);

      await member.send({ embeds: [userEmbed] }).catch(error => {});

      return resolve(null);
    });
  }
};
