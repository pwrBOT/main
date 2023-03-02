const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require(`discord.js`);
const userInfos = require("../../functions/userManagement/userInfos");
const usersRepository = require("../../mysql/usersRepository");

module.exports = {
  name: "userinfo",
  category: "admintools",
  description: "Informationen über einen User anzeigen",
  data: new SlashCommandBuilder()
    .setName(`info`)
    .setDescription(`Informationen ausgeben lassen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
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
      if (interaction.options.getSubcommand() === "user") {
        const { options, guild } = interaction;
        const member = options.getMember("user");
        if (!member) {
          interaction.reply({
            content: "❌ Der User ist nicht mehr auf dem Server ❌",
            ephemeral: true
          });
          return resolve(null);
        }

        let userId = member.id;
        let guildId = guild.id;
        let userData = await usersRepository.getUser(userId, guildId);

        if (!userData) {
          interaction.reply({
            content: `❌ Kein Daten zu ${member} verfügbar! ❌`,
            ephemeral: true
          });
          return resolve(null);
        }

        const totalVoiceTime = userInfos.getVoiceTime(userData);
        let totalVoiceTimeDays = (userData.totalVoiceTime / 60 / 24).toFixed(1);

        let currentUserXp = userData?.xP ?? 0;
        let currentLevel = userData?.Level ?? 0;
        let nextLevelXP = userData.Level * userData.Level * 100 + 100;

        const warnsText = await userInfos.getCurrentWarns(member);
        const oldWarnsText = await userInfos.getOldWarns(member);
        const userVCActivity = await userInfos.getUserVCActivity(member, guild);


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
              name: `Bot:`,
              value: `${member.user.bot}`,
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
              name: `\u200B`,
              value: `\u200B`,
              inline: true
            },
            {
              name: `Verbrachte Zeit im Voice-Channel:`,
              value: `${totalVoiceTime}\n${totalVoiceTimeDays} Tage`,
              inline: true
            },
            {
              name: `Nachrichten gesendet:`,
              value: `${userData.messageCount}`,
              inline: true
            },
            {
              name: `\u200B`,
              value: `\u200B`,
              inline: true
            },
            {
              name: `Rollen:`,
              value: `${member.roles.cache
                .map((r) => r)
                .join(" ")
                .replace("@everyone", " " || "None")}`,
              inline: false
            },
            {
              name: `Aktive Verwarnungen:`,
              value: `${warnsText}`,
              inline: false
            },
            {
              name: `Abgelaufene / gelöschte Verwarnungen:`,
              value: `${oldWarnsText}`,
              inline: false
            },
            {
              name: `VoiceChannel Aktivität:`,
              value: `${userVCActivity ?? "-"}`,
              inline: false
            }
          ]);

        await interaction.reply({ embeds: [userembed], ephemeral: true });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        commandLogRepository.logCommandUse(
          interaction.guild,
          "info user",
          interaction.user,
          interaction.member.user,
          "-"
        );

        return resolve(null);
      }
    });
  }
};
