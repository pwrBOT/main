const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const guildsRepository = require("../../mysql/guildsRepository");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Warn/Fremdwerbung")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
  async execute(interaction, client) {
    return new Promise(async resolve => {
      const { channel } = interaction;

      const message = await channel.messages.fetch(interaction.targetId);
      const member = message.member;
      const servername = interaction.guild.name;
      const guild = interaction.guild;

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
            "❌ Du kannst Nachrichten des Serverinhabers nicht moderieren! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const teamRoleId = await guildsRepository.getGuildSetting(
        interaction.guild,
        "teamRole"
      );

      try {
        if (member.roles.cache.has(teamRoleId.value)) {
          await interaction.reply({
            content:
              "❌ Du kannst Nachrichten von Teammitgliedern nicht moderieren! ❌",
            ephemeral: true
          });
          return resolve(null);
        }
      } catch (error) {}

      if (member.id === client.user.id) {
        await interaction.reply({
          content: "❌ Du kannst Nachrichten des Bots nicht moderieren! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const embedInfo = await guildsRepository.getGuildSetting(
        guild,
        "embedinfo"
      );
      if (!embedInfo) {
        embedInfo = "Bei Fragen wende dich an die Communityleitung!";
      }

      let messageContent = message?.content || "*Kein Nachrichtentext - Nur Bild*"

      const warnembed = new EmbedBuilder()
        .setTitle(`⚡️ Warning-System ⚡️`)
        .setDescription(`User: ${member.displayName} (${member}) wurde verwarnt`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(member.displayAvatarURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Grund:`,
            value: `Eigen- / Fremdwerbung`,
            inline: true
          },
          {
            name: `Moderator:`,
            value: interaction.user.tag,
            inline: true
          },
          {
            name: `Nachricht:`,
            value: messageContent,
            inline: false
          },
        ]);

      const warnembedmember = new EmbedBuilder()
        .setTitle(`⚡️ Warning-System ⚡️`)
        .setDescription(`Du wurdest soeben verwarnt!\nServer: ${servername}`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Grund:`,
            value: `Eigen- / Fremdwerbung`,
            inline: true
          },
          {
            name: `Information:`,
            value: `${embedInfo}`,
            inline: false
          }
        ]);

      await message.delete().catch(error => {});
      await interaction.channel
        .send(`*Nachricht von ${member} entfernt! Eigen- / Fremdwerbung 😒*`)
        .catch(error => {});

      const logChannel = require("../../mysql/loggingChannelsRepository");
      const modLogMessage = await logChannel.logChannel(
        interaction.guild,
        "modLog",
        warnembed
      );

      try {
        await member.send({ embeds: [warnembedmember] }).catch(error => {});
      } catch (error) {}

      const warnSystem = require("../../functions/warningSystem/warnings");
      await warnSystem.warnUser(
        interaction.guild,
        member,
        "warn - Eigen- / Fremdwerbung App",
        interaction.member.user.tag,
        interaction.member.user.id
      );
      await warnSystem.autoModWarn(interaction.guild, member);

      await interaction.reply({ content: `✅ Die Nachricht von ${member} wurde gelöscht und der User verwarnt.`, ephemeral: true })

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "warn - FremdwerbungApp",
        interaction.user,
        member.user,
        "-"
      );
    });
  }
};
