const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  name: "unban",
  category: "moderation",
  description: "User entbannen (User-Id erforderlich)",
  data: new SlashCommandBuilder()
    .setName(`unban`)
    .setDescription(`User entbannen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option
        .setName("userid")
        .setDescription("UserID von dem User, der entbannt werden soll")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("Begründung").setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const { options, user, guild } = interaction;
      const memberId = options.getString("userid");
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const servername = guild.name;
      const member = await client.users.fetch(memberId);

      if (!member) {
        await interaction.editReply(
          `User mit ID: memberId wurde nicht gefunden!`
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
        .setTitle(`⚡️ Moderation ⚡️`)
        .setDescription(`User: ${member} wurde entbannt`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true
          },
          {
            name: `Moderator:`,
            value: interaction.user.tag,
            inline: true
          }
        ]);

      const banembedmember = new EmbedBuilder()
        .setTitle(`⚡️ Moderation ⚡️`)
        .setDescription(`Du wurdest entbannt!\n\nServer: "${servername}"\n`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true
          },
          {
            name: `Moderator:`,
            value: interaction.user.tag,
            inline: true
          },
          {
            name: `Information:`,
            value: `${embedInfo}`,
            inline: false
          }
        ]);

      const newMessage = `User ${member} wurde entbannt ✅`;
      await interaction.editReply({ content: newMessage });

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", banembed);

      interaction.guild.members.unban(member).catch(console.error);

      try {
        await member.send({ embeds: [banembedmember] });
      } catch (error) {}

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "unban",
        interaction.user,
        member.tag,
        reason
      );

      return resolve(null);
    });
  }
};
