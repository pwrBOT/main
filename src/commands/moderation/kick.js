const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "kick",
  category: "moderation",
  description: "User vom Discord kicken",
  data: new SlashCommandBuilder()
    .setName(`kick`)
    .setDescription(`User vom Server kicken`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User der gekickt werden soll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Begründung").setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true,
      });

      const { options, user, guild } = interaction;
      const member = options.getMember("user");
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const servername = guild.name;

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      if (member.id === user.id) {
        interaction.editReply("❌ Du kannst dich nicht selber kicken! ❌");
        return resolve(null);
      }

      if (member.id === client.user.id) {
        interaction.editReply("❌ Du kannst den Bot nicht kicken! ❌");
        return resolve(null);
      }

      if (guild.ownerId === member.id) {
        interaction.editReply(
          "❌ Du kannst den Serverinhaber nicht kicken! ❌"
        );
        return resolve(null);
      }

      if (member.manageable === false) {
        interaction.editReply(
          "❌ Du hast zuwenig Power um den Befehl auszuführen ❌"
        );
        return resolve(null);
      }

      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        interaction.editReply("❌ Du kannst keinen Admin kicken! ❌");
        return resolve(null);
      }

      const guildsRepository = require("../../mysql/guildsRepository");
      const embedInfo = await guildsRepository.getGuildSetting(
        guild,
        "embedinfo"
      );
      if (!embedInfo) {
        embedInfo = "Bei Fragen wende dich an die Communityleitung!";
      }

      const kickembed = new EmbedBuilder()
        .setTitle(`⚡️ Moderation ⚡️`)
        .setDescription(`User: ${member} wurde vom Server gekickt`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(member.displayAvatarURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true,
          },
          {
            name: `Moderator:`,
            value: interaction.user.username,
            inline: true,
          },
        ]);

      const kickembedmember = new EmbedBuilder()
        .setTitle(`⚡️ Moderation ⚡️`)
        .setDescription(`Du wurdest gekickt!\n\nServer: "${servername}"\n`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true,
          },
          {
            name: `Moderator:`,
            value: interaction.user.username,
            inline: true,
          },
          {
            name: `Information:`,
            value: `${embedInfo}`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde gekickt ✅`;
      await interaction.editReply({ content: newMessage });
      try {
        setTimeout(function() {
          interaction.deleteReply().catch(error => {});;
        }, 5000);
      } catch (error) {}

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", kickembed);

      member.kick({ reason }).catch(console.error);
      try {
        await member.send({ embeds: [kickembedmember] }).catch(error => {});
      } catch (error) {}

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "kick",
        interaction.user,
        member.user,
        reason
      );

      return resolve(null);
    });
  },
};
