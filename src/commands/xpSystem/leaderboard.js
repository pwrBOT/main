const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require(`discord.js`);
const guildSettings = require("../../mysql/guildsRepository");
const timeOutMap = new Map()

module.exports = {
  name: "leaderboard",
  category: "info",
  description: "Sendet das aktuelle XP-Leaderboard in den Channel",
  data: new SlashCommandBuilder()
    .setName(`leaderboard`)
    .setDescription(`Leaderboard anzeigen`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    return new Promise(async resolve => {
      await interaction.deferReply({
        fetchReply: true,
        ephemeral: false
      });

      // ############ TIMEOUT COMMAND CHECK ############ \\
      if (timeOutMap.has(interaction.member.id)){
        interaction.editReply({content:`⏰ Command Cooldown | Du kannst den Command nur alle 60 Minuten nutzen 🥱`});
        return resolve(null)
      } else {
        timeOutMap.set(interaction.member.id)
        setTimeout(() =>{
          timeOutMap.delete(interaction.member.id)
        }, 3600000)
      }
      // ################################################ \\

      const usersRepository = require("../../mysql/usersRepository");
      const users = await usersRepository.getUsers(interaction.guild.id);

      if (!users) {
        interaction.editReply("❌ Keine User gefunden ❌");
      }

      const teamRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "teamRole"
      );

      const teamRole = await interaction.guild.roles.fetch(
        teamRoleId.value
      );

      let usersWOTeam = [];
      await users.forEach(async user => {
        let member = "";
        try {
          member = await interaction.guild.members.fetch(user.userId);
        } catch (error) {}

        if (member) {
          if (
            member.roles.cache.find(role => role.id == teamRole.id) ||
            member.roles.cache.find(role => role.id == "947612291833143337") ||
            member.user.bot === true
          ) {
          } else {
            usersWOTeam.push(user);
          }
        }
      });

      const sorting = (a, b) => {
        return b.xP - a.xP;
      };

      sortedUsers = usersWOTeam.sort(sorting);

      let leaderboardIndex = "";
      let leaderboardUsername = "";
      let leaderboardXP = "";

      await sortedUsers.slice(0, 25).forEach(async (user, index) => {
        const userIndex = index + 1;
        leaderboardIndex += `${userIndex}\n`;
        leaderboardUsername += `${user.userName}\n`;
        
        if (user.totalVoiceTime == 0) {
          leaderboardXP += `${user.xP} XP\t/\t"-"\n`;
        } else if (user.totalVoiceTime > 60) {
          const voiceTime = user.totalVoiceTime / 60;
          leaderboardXP += `${user.xP} XP\t/\t${voiceTime.toFixed(1)} Stunden\n`;
        } else {
          const voiceTime = user.totalVoiceTime;
          leaderboardXP += `${user.xP} XP\t/\t${voiceTime} Minuten\n`;
        }
      });

      const leaderboardEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Level System ⚡️`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `*Ranking ohne Team-Mitglieder`
        })
        .addFields([
          {
            name: `Platz:`,
            value: `${leaderboardIndex}`,
            inline: true
          }
        ])
        .addFields([
          {
            name: `Username:`,
            value: `${leaderboardUsername}`,
            inline: true
          }
        ])
        .addFields([
          {
            name: `XP\t/\tVoiceTime:`,
            value: `${leaderboardXP}`,
            inline: true
          }
        ]);

      interaction.editReply({ embeds: [leaderboardEmbed]});


      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "leaderboard",
        interaction.user,
        "-",
        "-"
      );
      return resolve(null);
    });
  }
};
