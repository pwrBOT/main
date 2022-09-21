const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "unban",
  category: "moderation",
  description: "User entbannen (User-Id erforderlich)",
  data: new SlashCommandBuilder()
    .setName(`unban`)
    .setDescription(`User entbannen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription("UserID von dem User, der entbannt werden soll")
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
      const member = options.getString("userid");
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const servername = guild.name;
      const memberData = client.users.cache.get(member);

      if (member.manageable === false) {
        interaction.editReply(
          "❌ Der Bot hat zuwenig Power um den Befehl auszuführen ❌"
        );
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

      const banembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(
          `User: ${memberData.username}#${memberData.discriminator} wurde entbannt`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(memberData.displayAvatarURL())
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
            value: interaction.user.tag,
            inline: true,
          },
        ]);

      const banembedmember = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(`Du wurdest entbannt!\n\nServer: "${servername}"\n`)
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
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: `Information:`,
            value: `${embedInfo}`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde entbannt ✅`;
      await interaction.editReply({ content: newMessage });
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", banembed);

      interaction.guild.members.unban(member).catch(console.error);
      client.users.cache
        .get(member)
        .send({ embeds: [banembedmember] })
        .catch(console.error);

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "unban",
        interaction.user,
        memberData,
        reason
      );

      return resolve(null);
    });
  },
};
