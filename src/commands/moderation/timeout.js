const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "timeout",
  category: "moderation",
  description: "User für einen bestimmten Zeitraum timeouten",
  data: new SlashCommandBuilder()
    .setName(`timeout`)
    .setDescription(`User timeouten / Timeout entfernen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName(`add`)
        .setDescription(`User timeouten`)
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User der getimeouted werden soll")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("length")
            .setDescription("Wie lange soll der Timeout sein?")
            .setRequired(true)
            .addChoices(
              { name: "30 Minuten", value: "30m" },
              { name: "1 Stunde", value: "1h" },
              { name: "1 Tag", value: "1d" },
              { name: "1 Woche", value: "1w" },
              { name: "4 Wochen", value: "4w" },
              { name: "Unbegrenzt", value: "99y" }
            )
        )
        .addStringOption(option =>
          option
            .setName("reason")
            .setDescription("Begründung")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(`remove`)
        .setDescription(`Timeout entfernen`)
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User der getimeouted werden soll")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("reason")
            .setDescription("Begründung")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });

      const { options, user, guild } = interaction;
      const member = options.getMember("user");
      const length = options.getString("length");
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const servername = guild.name;

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      if (member.id === user.id) {
        interaction.editReply("❌ Du kannst dich nicht selber timeouten! ❌");
        return resolve(null);
      }

      if (member.id === client.user.id) {
        interaction.editReply("❌ Du kannst den Bot nicht timeouten! ❌");
        return resolve(null);
      }

      if (guild.ownerId === member.id) {
        interaction.editReply(
          "❌ Du kannst den Serverinhaber nicht timeouten! ❌"
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
        interaction.editReply("❌ Du kannst keinen Admin timeouten! ❌");
        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "add") {

        if (member.isCommunicationDisabled()) {
          interaction.editReply("❌ Der User hat bereits ein Timeout! ❌");
          return resolve(null);
        }

        if (!length)
          return interaction
            .editReply("❌ Wähle einen gültigen Zeitraum aus! ❌")
            .then(
              setTimeout(function() {
                interaction.deleteReply();
              }, 3000)
            );

        const guildsRepository = require("../../mysql/guildsRepository");
        const embedInfo = await guildsRepository.getGuildSetting(
          guild,
          "embedinfo"
        );
        if (!embedInfo) {
          embedInfo = "Bei Fragen wende dich an die Communityleitung!";
        }

        const modlogembed = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(
            `User: ${member} wurde getimeouted!\nDauer: ${length}`
          )
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

        const embedmember = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(
            `Du wurdest getimeouted!\nServer: "${servername}"\nDauer: ${length}!`
          )
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

        member.timeout(ms(length), reason);

        await interaction.editReply({ embeds: [modlogembed] });

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(interaction.guild, "modLog", modlogembed);

        try {
          await member.send({ embeds: [embedmember] });
        } catch (error) {}

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "timeout add",
          interaction.user,
          member.user,
          "-"
        );

        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "remove") {

        if (!member.isCommunicationDisabled()) {
          interaction.editReply("❌ Der User ist nicht getimeouted! ❌");
          return resolve(null);
        }

        const modlogembed2 = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(
            `Timeout von User: ${member} entfernt ✅\n\nModerator: ${interaction
              .user.tag}`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          });

        const embedmember2 = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(
            `Dein Timeout wurde entfernt. \nDu wurdest freigegeben ✅\n\nServer: "${servername}"\n\nModerator: ${interaction
              .user.tag}`
          )
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
          ])
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          });

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(interaction.guild, "modLog", modlogembed2);
        try {
          await member.send({ embeds: [embedmember2] });
        } catch (error) {}
        interaction.editReply({
          content: `Timeout von User: ${member} entfernt ✅`
        });

        member.timeout(null).catch(console.error);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "timeout remove",
          interaction.user,
          member.user,
          reason
        );

        return resolve(null);
      }
    });
  }
};
