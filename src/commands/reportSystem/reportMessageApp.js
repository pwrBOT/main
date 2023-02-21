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
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
    .setDMPermission(false),
  async execute(interaction, client) {
    return new Promise(async resolve => {
      const { channel } = interaction;

      const message = await channel.messages.fetch(interaction.targetId);
      const member = message.member;

      if (!message) {
        interaction.reply({
          content: "❌ Die Nachricht existiert nicht mehr ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      if (interaction.guild.ownerId === member.id) {
        interaction.reply({
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
          interaction.reply({
            content:
              "❌ Du kannst Nachrichten von Teammitgliedern nicht reporten! ❌",
            ephemeral: true
          });
          return resolve(null);
        }
      } catch (error) {}

      if (member.id === client.user.id) {
        interaction.reply({
          content: "❌ Du kannst Nachrichten des Bots nicht reporten! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const reportedMessageEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Report System ⚡️`)
        .setDescription(`Eine Nachricht von ${member} wurde soeben gemeldet.`)
        .addFields([
          {
            name: `Beschwerdeführer:`,
            value: `${interaction.member}`,
            inline: false
          },
          {
            name: `Nachricht:`,
            value: `${message.content}\n\n[>>> Link zur Nachricht <<<](${message.url})`,
            inline: false
          }
        ])
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0x51ff00)
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

      interaction.reply({
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
