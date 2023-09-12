const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const guildsRepository = require("../../mysql/guildsRepository");

module.exports = {
  name: "ldsadmin",
  category: "lds",
  description: "Lüdenscheid Mod - Auffälliger User",
  data: new SlashCommandBuilder()
    .setName("auffälligeruser")
    .setDescription(`Auffälliger User System`)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`add`)
        .setDescription(`Auffälligen User hinzufügen`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User der notiert werden soll")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { options } = interaction;
      const member = options.getMember("user");

      if (!member) {
        await interaction.reply({
          content: "❌ Der User ist nicht mehr auf dem Server ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      if (interaction.guild.ownerId === member.id) {
        await interaction.reply({
          content: "❌ Du kannst den Serverinhaber nicht moderieren! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      const teamRoleId = await guildsRepository.getGuildSetting(
        interaction.guild,
        "teamRole"
      );

      try {
        if (member.roles.cache.has(teamRoleId.value)) {
          await interaction.reply({
            content: "❌ Du kannst Teammitglieder nicht moderieren! ❌",
            ephemeral: true
          });
          return resolve(null);
        }
      } catch (error) {}

      if (member.id === client.user.id) {
        await interaction.reply({
          content: "❌ Du kannst den Bot Bot nicht moderieren! ❌",
          ephemeral: true
        });
        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "add") {

        const conspicuous_user = new StringSelectMenuBuilder()
          .setCustomId(`conspicuous_user`)
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            new StringSelectMenuOptionBuilder({
              label: `Allgemein auffälliger User`,
              value: `Allgemein auffälliger User | ${member.id}`
            }),
            new StringSelectMenuOptionBuilder({
              label: `Verlässt Runden wenn er POL spielen muss`,
              value: `Verlässt Runden wenn er POL spielen muss | ${member.id}`
            }),
            new StringSelectMenuOptionBuilder({
              label: `Verlässt immer wieder MP-Runden`,
              value: `Verlässt immer wieder MP-Runden | ${member.id}`
            }),
            new StringSelectMenuOptionBuilder({
              label: `Täuscht Sachen vor um MP-Runden zu verlassen`,
              value: `Täuscht Sachen vor um MP-Runden zu verlassen | ${member.id}`
            }),
            new StringSelectMenuOptionBuilder({
              label: `Abbrechen`,
              value: `Abbrechen`
            })
          );

        await interaction.reply({
          components: [new ActionRowBuilder().addComponents(conspicuous_user)],
          ephemeral: true
        });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "conspicuousUser Add",
          interaction.user,
          member.user,
          "-"
        );
      }

      return resolve(null);
    });
  }
};
