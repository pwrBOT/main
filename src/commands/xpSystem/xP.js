const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const usersRepository = require("../../mysql/usersRepository");
const xPSystemGiveRole = require("../../functions/userManagement/xPSystemGiveRole");

module.exports = {
  name: "xp",
  category: "admin",
  description: "Member XP Verwaltung",
  data: new SlashCommandBuilder()
    .setName(`xp`)
    .setDescription(`Member XP Verwaltung`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
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
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Begründung")
            .setRequired(true)
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
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Begründung")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const message = await interaction.deferReply({
        ephemeral: false,
        fetchReply: true
      });

      const { options, user, guild } = interaction;
      const member = options.getMember("member");
      const xP = options.getNumber("xp");
      const reason =
        interaction.options.getString("reason") || "Kein Grund angegeben";

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      const getMember = await usersRepository.getUser(member.user.id, guild.id);

      if (!getMember) {
        interaction.editReply("❌ Du kannst diesem User keine XP geben ❌");
        return resolve(null);
      }

      let currentXP = getMember.xP;

      if (!currentXP) {
        currentXP = 0;
      }

      if (interaction.options.getSubcommand() === "give") {
        let newXP = currentXP + xP;
        let currentLevel = getMember.Level;
        let newLevel = getMember.Level;
        let requiredXP = newLevel * newLevel * 100 + 100;

        while (requiredXP <= newXP) {
          newLevel += 1;
          requiredXP = newLevel * newLevel * 100 + 100;
        }

        await usersRepository.updateUser(guild.id, member.user.id, "xP", newXP);
        await usersRepository.updateUser(
          guild.id,
          member.user.id,
          "Level",
          newLevel
        );
        await xPSystemGiveRole.autoUserRoles(guild, member, getMember.Level);

        const xPembed = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(`${member} hat ${xP} XP erhalten.`)
          .setColor(0xffd800)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `XP:`,
              value: `Alt: ${currentXP}\nNeu: ${newXP}`,
              inline: true
            },
            {
              name: `Level:`,
              value: `Alt: ${currentLevel}\nNeu: ${newLevel}`,
              inline: true
            },
            {
              name: `Grund:`,
              value: `${reason}`,
              inline: false
            },
            {
              name: `Moderator:`,
              value: `${user.tag}`,
              inline: false
            }
          ]);

        await interaction.editReply({ embeds: [xPembed] });

        const LoggingChannels = require("../../mysql/loggingChannelsRepository");
        await LoggingChannels.logChannel(interaction.guild, "botLog", xPembed);

        xPembed.setDescription(`Du hast soeben ${xP} XP erhalten.`);
        await member.send({ embeds: [xPembed] }).catch((error) => {});

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
        let newXP = currentXP - xP;
        let currentLevel = getMember.Level;
        let newLevel = getMember.Level;
        let requiredXP = newLevel * newLevel * 100 + 100;

        while (requiredXP >= newXP) {
          newLevel -= 1;
          requiredXP = newLevel * newLevel * 100 + 100;
        }

        newLevel += 1;
        await usersRepository.updateUser(guild.id, member.user.id, "xP", newXP);
        await usersRepository.updateUser(
          guild.id,
          member.user.id,
          "Level",
          newLevel
        );
        await xPSystemGiveRole.autoUserRoles(guild, member, getMember.Level);

        const xPembed = new EmbedBuilder()
          .setTitle(`⚡️ Moderation ⚡️`)
          .setDescription(`${xP} XP von ${member} entfernt.`)
          .setColor(0xffd800)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `XP:`,
              value: `Alt: ${currentXP}\nNeu: ${newXP}`,
              inline: true
            },
            {
              name: `Level:`,
              value: `Alt: ${currentLevel}\nNeu: ${newLevel}`,
              inline: true
            },
            {
              name: `Grund:`,
              value: `${reason}`,
              inline: false
            },
            {
              name: `Moderator:`,
              value: `${user.tag}`,
              inline: false
            }
          ]);

        await interaction.editReply({ embeds: [xPembed] });

        xPembed.setDescription(`Dir wurden soeben ${xP} XP abgezogen.`);
        await member.send({ embeds: [xPembed] }).catch((error) => {});

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
  }
};
