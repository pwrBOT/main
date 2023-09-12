const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const guildSettings = require("../../mysql/guildsRepository");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Nachricht melden")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false),
  async execute(interaction, client) {
    return new Promise(async resolve => {
      const { channel } = interaction;

      const message = await channel.messages.fetch(interaction.targetId);
      const member = message.member;

      if (!message) {
        await interaction.reply({
          content: "❌ Die Nachricht existiert nicht mehr ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      if (interaction.guild.ownerId === member.id) {
        await interaction.reply({
          content:
            "❌ Du kannst Nachrichten des Serverinhabers nicht reporten! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const teamRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "teamRole"
      );

      try {
        if (member.roles.cache.has(teamRoleId.value)) {
          await interaction.reply({
            content:
              "❌ Du kannst Nachrichten von Teammitgliedern nicht reporten! ❌",
            ephemeral: true
          });
          return resolve(null);
        }
      } catch (error) {}

      if (member.id === client.user.id) {
        await interaction.reply({
          content: "❌ Du kannst Nachrichten des Bots nicht reporten! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      let messageContent = ""

      if (message.content.length > 800) {
        messageContent = (message.content).slice(0,800) + "....."
      } else {
        messageContent = message.content
      }

      const reportedMessageEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Report System ⚡️`)
        .setDescription(`Eine Nachricht von ${member.displayName} (${member}) wurde soeben gemeldet.`)
        .addFields([
          {
            name: `Nachricht:`,
            value: `${messageContent}\n\n[---> Zur Nachricht](${message.url})`,
            inline: false
          },
          {
            name: `Channel:`,
            value: `${message.channel}`,
            inline: true
          },
          {
            name: `Beschwerdeführer:`,
            value: `${interaction.member.displayName} (${interaction.member})`,
            inline: true
          }
        ])
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0xff6600)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`
        });

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(
        interaction.guild,
        "modLog",
        reportedMessageEmbed
      );

      await interaction.reply({
        content: `✅ Die Nachricht von ${member} wurde an die Moderatoren übermittelt. Danke für deine Meldung 🙂`,
        ephemeral: true
      });

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "reportMessage/app",
        interaction.user,
        "-",
        "-"
      );
    });
  }
};
