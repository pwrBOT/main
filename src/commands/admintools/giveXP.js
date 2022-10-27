const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const usersRepository = require("../../mysql/usersRepository");

module.exports = {
  name: "xp",
  category: "admin",
  description: "Member XP Verwaltung",
  data: new SlashCommandBuilder()
    .setName(`xp`)
    .setDescription(`Member XP Verwaltung`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`give`)
        .setDescription(`Member XP geben`)
        .addUserOption((option) =>
          option.setName("member").setDescription("Member").setRequired(true)
        )
        .addNumberOption((option) =>
          option.setName("xp").setDescription("Anzahl der XP").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`remove`)
        .setDescription(`XP von Member entfernen`)
        .addUserOption((option) =>
          option.setName("member").setDescription("Member").setRequired(true)
        )
        .addNumberOption((option) =>
          option.setName("xp").setDescription("Anzahl der XP").setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: false,
        fetchReply: true,
      });

      const { options, user, guild } = interaction;
      const member = options.getMember("member");
      const xP = options.getNumber("xp");

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      const getMember = await usersRepository.getUser(member.user.id, guild.id);

      if (!getMember) {
        interaction.editReply("❌ Du kannst diesem User keine XP geben ❌");
        return resolve(null);
      }

      if (member.user.bot == true) {
        interaction.editReply("❌ Der Bot kann keine XP bekommen ❌");
        return resolve(null);
      }

      let currentXP = getMember.xP;

      if (!currentXP) {
        currentXP = 0;
      }

      if (interaction.options.getSubcommand() === "give") {
        var newXP = currentXP + xP;
        await usersRepository.addUserXP(guild.id, member.user, newXP);

        const requiredXP = getMember.Level * getMember.Level * 100 + 100;

        if (newXP >= requiredXP) {
          let newLevel = (getMember.Level += 1);
          await usersRepository.addUserLevel(guild.id, member.user, newLevel);
        }
        

        const xPembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
          .setDescription(
            `${member} hat ${xP} XP erhalten.\nModerator: ${user.tag}`
          )
          .setColor(0xffd800)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          });

        await interaction.editReply({ embeds: [xPembed] });

        const LoggingChannels = require("../../mysql/loggingChannelsRepository");
        await LoggingChannels.logChannel(interaction.guild, "botLog", xPembed);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "xp give",
          interaction.user,
          member.user,
          "-"
        );

        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "remove") {
        var newXP = currentXP - xP;
        await usersRepository.addUserXP(guild.id, member.user, newXP);

        const requiredXP = getMember.Level * getMember.Level * 100 + 100;

        if (newXP <= requiredXP) {
          let newLevel = (getMember.Level -= 1);
          await usersRepository.addUserLevel(guild.id, member.user, newLevel);
        }

        const xPembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
          .setDescription(
            `${xP} XP von ${member} entfernt.\nModerator: ${user.tag}`
          )
          .setColor(0xffd800)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          });

        await interaction.editReply({ embeds: [xPembed] });

        const LoggingChannels = require("../../mysql/loggingChannelsRepository");
        await LoggingChannels.logChannel(interaction.guild, "botLog", xPembed);

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "xp remove",
          interaction.user,
          member.user,
          "-"
        );

        return resolve(null);
      }
    });
  },
};
