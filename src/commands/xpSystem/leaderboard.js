const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require(`discord.js`);

module.exports = {
  name: "leaderboard",
  category: "info",
  description: "Sendet das aktuelle XP-Leaderboard in den Channel",
  data: new SlashCommandBuilder()
    .setName(`leaderboard`)
    .setDescription(`Leaderboard anzeigen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const usersRepository = require("../../mysql/usersRepository");
      const users = await usersRepository.getUsers(interaction.guild.id);

      if (!users) {
        interaction.reply("❌ Keine User gefunden ❌");
      }

      const sorting = (a, b) => {
        return b.xP - a.xP;
      };
      sortedUsers = await users.sort(sorting);

      let leaderboardIndex = "";
      let leaderboardUsername = "";
      let leaderboardXP = "";

      sortedUsers.slice(0, 25).forEach(async (user, index) => {

        const userIndex = index + 1;
        leaderboardIndex += `${userIndex}\n`;
        leaderboardUsername += `${user.userName}\n`;
        leaderboardXP += `${user.xP} XP\n`;

      });
      
      const leaderboardEmbed = new EmbedBuilder()
          .setTitle(`⚡️ Level System ⚡️`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .addFields([
            {
              name: `Platz:`,
              value: `${leaderboardIndex}`,
              inline: true,
            },
          ])
          .addFields([
            {
              name: `Username:`,
              value: `${leaderboardUsername}`,
              inline: true,
            },
          ])
          .addFields([
            {
              name: `XP:`,
              value: `${leaderboardXP}`,
              inline: true,
            },
          ]);

          interaction.reply({ embeds: [leaderboardEmbed] });

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
  },
};
