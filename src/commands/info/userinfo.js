const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require(`discord.js`);
const warnsRepository = require("../../mysql/warnsRepository");
const usersRepository = require("../../mysql/usersRepository");

module.exports = {
  name: "userinfo",
  category: "admintools",
  description: "Informationen über einen User anzeigen",
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
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      if (interaction.options.getSubcommand() === "user") {
        const { options, guild } = interaction;
        const member = options.getMember("user");
        if (!member) {
          interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
          return resolve(null);
        }

        let userId = member.id;
        let guildId = guild.id;
        let user = await usersRepository.getUser(userId, guildId);

        let currentUserXp = 0;
        let currentLevel = 0;
        let nextLevelXP = 0;

        if (user == null) {
          currentUserXp = 0
          currentLevel = 0
          nextLevelXP = 100
        } else {
          currentUserXp = user.xP;
          currentLevel = user.Level;
          nextLevelXP = user.Level * user.Level * 100 + 100;
        }

        let warnsText = "";
        let warns = await warnsRepository.getWarns(member, 10);

        if (!warns) {
          return resolve(null);
        }

        if (warns.length === 0) {
          warnsText = `Der User hat keine Verwarnungen!`;
        } else {
          warns.forEach((warn) => {
            const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
            const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit"
            });
            const spacer = `\u00A0\u00A0\u00A0\u00A0`;
            warnsText += `${date}  •  ${time}h:${spacer}${warn.warnReason}\n`;
          });
        }

        const userembed = new EmbedBuilder()
          .setTitle(`⚡️ User Info ⚡️`)
          .setDescription(
            `Diese Information ist ausschließlich für Server-Admins! Die Weitergabe von Informationen ist nicht erlaubt!`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .setThumbnail(member.user.displayAvatarURL())
          .addFields([
            {
              name: `Username:`,
              value: `${member.user.username} #${member.user.discriminator}`,
              inline: true
            },
            {
              name: `User ID:`,
              value: `${member.user.id}`,
              inline: true
            },
            {
              name: `\u200B`,
              value: `\u200B`,
              inline: true
            },
            {
              name: `Account erstellt:`,
              value: `${new Date(
                member.user.createdTimestamp
              ).toLocaleDateString("de-DE")} | ${new Date(
                member.user.createdTimestamp
              ).toLocaleTimeString("de-DE")}`,
              inline: true
            },
            {
              name: `Am Server seit:`,
              value: `${new Date(member.joinedTimestamp).toLocaleDateString(
                "de-DE"
              )} | ${new Date(member.joinedTimestamp).toLocaleTimeString(
                "de-DE"
              )}`,
              inline: true
            },
            {
              name: `\u200B`,
              value: `\u200B`,
              inline: true
            },
            {
              name: `Bot:`,
              value: `${member.user.bot}`,
              inline: true
            },
            {
              name: `XP:`,
              value: `${currentUserXp} / ${nextLevelXP}`,
              inline: true
            },
            {
              name: `Level:`,
              value: `${currentLevel}`,
              inline: true
            },
            {
              name: `Rollen:`,
              value: `${member.roles.cache
                .map((r) => r)
                .join(" ")
                .replace("everyone", " " || "None")}`,
              inline: false
            },
            {
              name: `Verwarnungen:`,
              value: `${warnsText}`,
              inline: false
            }
          ]);

        await interaction.editReply({ embeds: [userembed] });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        commandLogRepository.logCommandUse(
          interaction.guild,
          "info user",
          interaction.user,
          member.user,
          "-"
        );

        return resolve(null);
      }
    });
  }
};
