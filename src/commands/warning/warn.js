const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
  Guild
} = require("discord.js");
const warnsRepository = require("../../mysql/warnsRepository");

module.exports = {
  name: "warn",
  category: "warning",
  description: "Einen User verwarnen",
  data: new SlashCommandBuilder()
    .setName(`warn`)
    .setDescription(`User verwarnen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Member der verwarnt werden soll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Begründung").setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });
      const member = interaction.options.getMember("member");
      const reason =
        interaction.options.getString("reason") || "Kein Grund angegeben";
      const servername = interaction.guild.name;

      if (member.id === interaction.user.id) {
        interaction.editReply("❌ Du kannst dich nicht selber verwarnen! ❌");
        return resolve(null);
      }

      if (member.id === client.user.id) {
        interaction.editReply("❌ Du kannst den Bot verwarnen! ❌");
        return resolve(null);
      }

      if (interaction.guild.ownerId === member.id) {
        interaction.editReply(
          "❌ Du kannst den Serverinhaber nicht verwarnen! ❌"
        );
        return resolve(null);
      }

      if (member.manageable === false) {
        interaction.editReply(
          "❌ Der Bot hat zuwenig Power um den Befehl auszuführen ❌"
        );
        return resolve(null);
      }

      const warnembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
        .setDescription(`User: ${member} wurde verwarnt`)
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
            value: `${reason}`,
            inline: true
          },
          {
            name: `Moderator:`,
            value: interaction.user.tag,
            inline: true
          }
        ]);

      const warnembedmember = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
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
            value: `Bei Fragen wende dich bitte an die Projektleitung`,
            inline: false
          }
        ]);

      await interaction.editReply({ embeds: [warnembed] });
      setTimeout(function () {
        interaction.deleteReply();
      }, 5000);

      const logChannel = require("../../mysql/loggingChannelsRepository");
      const modLogMessage = await logChannel.logChannel(
        interaction.guild,
        "modLog",
        warnembed
      );

      try {
        await member.send({ embeds: [warnembedmember] });
      } catch (error) {}

      const warnSystem = require("../../events/eventFunctions/warnSystem");
      await warnSystem.warnUser(
        interaction.guild,
        member,
        reason,
        interaction.member.user.tag,
        interaction.member.user.id
      );
      await warnSystem.autoModWarn(interaction.guild, member);

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "warn",
        interaction.user,
        member.user,
        "-"
      );
      
      return resolve(null);
    });
  }
};
