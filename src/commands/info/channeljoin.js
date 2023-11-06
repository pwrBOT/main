const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder
} = require(`discord.js`);
const moment = require("moment");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "channelConnections",
  category: "admintools",
  description: "Die letzten Joins & Leaves eines Channels anzeigen lassen",
  data: new SlashCommandBuilder()
    .setName(`channelconnections`)
    .setDescription(`Die letzten Joins & Leaves eines Channels anzeigen lassen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel auswählen")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { options, guild } = interaction;
      const channel = options.getChannel("channel");

      const channelConnections = await userlogRepository.getLogsByChannelId(
        guild.id,
        channel.id,
        40
      );

      let message = "";
      let message2 = "";

      if (!channelConnections) {
        await interaction.reply({ content: `Keine Einträge gefunden!`, ephemeral: true});
        return
      }

      for (const channelConnection of channelConnections) {
        let member =
          (await guild.members.fetch(channelConnection.userId).catch(error => {})) ?? null;
        if (member == null) {
          member = await client.users.fetch(channelConnection.userId);
        }

        const timestamp = Date.parse(channelConnection.timestamp) / 1000;
        const action = channelConnection.action.replaceAll("JOIN", "➡️").replaceAll("LEAVE", "⬅️").replaceAll("SWITCH", "🔄")

        if (message.length >= 900) {
          if (message2.length >= 900) {
          } else {
            message2 += `${action} | ${member}  •  <t:${timestamp}:R>\n`;
          }
        } else {
          message += `${action} | ${member}  •  <t:${timestamp}:R>\n`;
        }
      }

      if (message.length == 0) message = "Es liegen keine Join / Leave Daten vor."
      if (message2.length == 0) message2 = "\u200B"


      const channelEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Channel Connections Info für ${channel} ⚡️`)
        .setDescription(
          `Diese Information ist ausschließlich für Server-Admins!`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `History:`,
            value: `${message}`,
            inline: true
          },
          {
            name: `\u200B`,
            value: `${message2}`,
            inline: true
          }
        ]);

        await interaction.reply({ embeds: [channelEmbed], ephemeral: true});

      const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        commandLogRepository.logCommandUse(
          interaction.guild,
          "channel connections info",
          interaction.user,
          interaction.member.user,
          "-"
        );
      return resolve(null);
    });
  }
};
