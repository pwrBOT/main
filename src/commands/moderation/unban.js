const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

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

      if (member.manageable === false) {
        interaction.editReply(
          "❌ Der Bot hat zuwenig Power um den Befehl auszuführen ❌"
        );
        return resolve(null);
      }

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        interaction.guild,
        1
      );
      if (!guildSettings) {
        return resolve(null);
      }

      const banembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(`User: ${client.users.cache.get(member.username)}#${client.users.cache.get(member.discriminator)} wurde entbannt`)
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
            value: interaction.user.tag,
            inline: true,
          },
        ]);

      const banembedmember = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(
          `Du wurdest entbannt!\n\nServer: "${servername}"\n`
        )
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
            value: `${guildSettings.embedInfo}`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde entbannt ✅`;
      await interaction.editReply({ content: newMessage });
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);

      const modLogChannel = guildSettings.modLog;
      if (modLogChannel === undefined) {
        interaction.reply(
          `Mod-Log Channel nicht gefunden! Bot Einrichtung abschließen`
        );
        setTimeout(function () {
          interaction.deleteReply();
        }, 3000);
      } else {
        client.channels.cache
          .get(modLogChannel)
          .send({ embeds: [banembed] })
          .catch(console.error);
      }
      interaction.guild.members.unban(member).catch(console.error);
      client.users.cache
        .get(member)
        .send({ embeds: [banembedmember] })
        .catch(console.error);


      const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(interaction.guild, "unban", interaction.user, member.user, reason)
        
      return resolve(null);
    });
  },
};
