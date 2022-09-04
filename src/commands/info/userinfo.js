const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require(`discord.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`info`)
    .setDescription(`Informationen ausgeben lassen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`user`)
        .setDescription(`Infos über User ausgeben`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User auswählen")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const message = await interaction.deferReply({
      ephemeral: true,
      fetchReply: true,
    });

    if (interaction.options.getSubcommand() === "user") {
      const pwrDB = require("../../mysql/createConnection");
      const { options, guild } = interaction;
      const member = options.getMember("user");
      if (!member) {
        return interaction.editReply(
          "❌ Der User ist nicht mehr auf dem Server ❌"
        );
      }

      var userId = member.id;
      var guildId = guild.id;

      var sqlshowwarns = `SELECT * FROM powerbot_warns WHERE userId = ${userId} AND guildId = ${guildId} ORDER BY userId DESC LIMIT 10`;
      pwrDB.query(sqlshowwarns, function (error, results) {
        if (error) throw error;
        var warns = "";
        if (results.length === 0) {
          warns = "Keine Verwarnungen vorhanden!";
        }
        results.forEach((el) => {
          warns += `${new Date(el.warnAdd).toLocaleDateString(
            "de-DE"
          )} • ${new Date(el.warnAdd).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}h:\u00A0\u00A0\u00A0\u00A0${el.warnReason}\n`;
        });
        

        const userembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | User Info ⚡️`)
          .setDescription(
            `Diese Information ist ausschließlich für Server-Admins! Die Weitergabe von Informationen ist nicht erlaubt!`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .setThumbnail(member.user.displayAvatarURL())
          .addFields([
            {
              name: `Username:`,
              value: `${member.user.username} #${member.user.discriminator}`,
              inline: true,
            },
            {
              name: `User ID:`,
              value: `${member.user.id}`,
              inline: true,
            },
            {
              name: `\u200B`,
              value: `\u200B`,
              inline: true,
            },
            {
              name: `Account erstellt:`,
              value: `${new Date(
                member.user.createdTimestamp
              ).toLocaleDateString("de-DE")} | ${new Date(
                member.user.createdTimestamp
              ).toLocaleTimeString("de-DE")}`,
              inline: true,
            },
            {
              name: `Am Server seit:`,
              value: `${new Date(member.joinedTimestamp).toLocaleDateString(
                "de-DE"
              )} | ${new Date(member.joinedTimestamp).toLocaleTimeString(
                "de-DE"
              )}`,
              inline: true,
            },
            {
              name: `\u200B`,
              value: `\u200B`,
              inline: true,
            },
            {
              name: `Bot:`,
              value: `${member.user.bot}`,
              inline: true,
            },
            {
              name: `Rollen:`,
              value: `${member.roles.cache.map(r => r).join(" ").replace("everyone", " " || "None")}`,
              inline: true,
            },
            {
              name: `\u200B`,
              value: `\u200B`,
              inline: true,
            },
            {
              name: `Verwarnungen:`,
              value: `${warns}`,
              inline: false,
            },
          ]);

        interaction.editReply({ embeds: [userembed] });

        const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
        commandLogRepository.logCommandUse(interaction.guild, "info user", interaction.user, member.user, "-")
      });
    }
  },
};
