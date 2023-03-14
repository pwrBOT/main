const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const guildsRepository = require("../../mysql/guildsRepository");

waitMap = new Map();

module.exports = {
  name: "nickname",
  category: "moderation",
  description: "Nickname ändern",
  data: new SlashCommandBuilder()
    .setName(`nickname`)
    .setDescription(`Nickname ändern`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`change`)
        .setDescription(`Eigenen Nickname ändern`)
        .addStringOption((option) =>
          option
            .setName("nickname")
            .setDescription("Neuer Nickname")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { member, guild, options } = interaction;

      if (interaction.options.getSubcommand() === "change") {
        const newNickname = options.getString("nickname");

        if (member.permissions.has(PermissionsBitField.Flags.ChangeNickname)) {
          await member
            .setNickname(newNickname, "Wunsch des Users")
            .catch(async (error) => {
              await interaction.reply({
                content: `Sry. Dein Nickname konnte aus einem unbekannten Grund nicht geändert werden.`,
                ephemeral: true
              });
              return resolve(null);
            });

          await interaction.reply({
            content: `Dein Nickname wurde geändert.\nAlt: ${member.displayName}\nNeu: ${newNickname}`,
            ephemeral: true
          });
          return resolve(null);
        } else {
          if (waitMap.has(member.id)) {
            await interaction.reply({
              content: `Du musst ein wenig warten bis du eine erneute Nickname-Änderung beantragen kannst.`,
              ephemeral: true
            });
          } else {
            const data = await guildsRepository.getGuildSetting(
              guild,
              "modLog"
            );

            const modLogChannelId = data?.value ?? null;

            if (modLogChannelId == null) {
              await interaction.reply({
                content: `Dieser Discord-Server hat keinen Moderations-Channel definiert. Wende dich bitte direkt an die Serverleitung!`,
                ephemeral: true
              });
              return resolve(null);
            }

            const modLogChannel = await guild.channels.fetch(modLogChannelId);

            const nicknameEmbed = new EmbedBuilder()
              .setTitle(`⚡️ Nickname Änderungsanfrage ⚡️`)
              .setDescription(`User: ${member} möchte seinen Nickname ändern`)
              .setColor(0x51ff00)
              .setTimestamp(Date.now())
              .setThumbnail(member.displayAvatarURL())
              .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `powered by Powerbot`
              })
              .addFields([
                {
                  name: `Neuer Wunsch-Nickname:`,
                  value: `${newNickname}`,
                  inline: false
                }
              ]);

            const buttonErledigt = new ButtonBuilder()
              .setCustomId("erledigt")
              .setLabel(`Erledigt`)
              .setStyle(ButtonStyle.Success)
              .setDisabled(false);

            await modLogChannel.send({
              embeds: [nicknameEmbed],
              components: [
                new ActionRowBuilder().addComponents([buttonErledigt])
              ]
            });

            await interaction.reply({
              content: `Dein Nickname-Änderungswunsch wurde an das Team übermittelt.`,
              ephemeral: true
            });

            waitMap.set(member.id);
            console.log(waitMap);

            setTimeout(() => {
              waitMap.delete(member.id);
              console.log(waitMap);
            }, 60000);
          }
        }
      }

      return resolve(null);
    });
  }
};
