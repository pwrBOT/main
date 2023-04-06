const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const usersRepository = require("../../mysql/usersRepository");

module.exports = {
  name: "geburtstag",
  category: "user",
  description: "Geburtstagsliste",
  data: new SlashCommandBuilder()
    .setName(`geburtstag`)
    .setDescription(`Geburtstagsliste`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`hinzufügen`)
        .setDescription(
          `Eigenen Geburtstag hinzufügen (Der Bot wird dir gratulieren)`
        )
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription(
              "Geburtsdatum eingeben. Format: YYYY-MM-DD | Beispiel: 1992-03-18"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`entfernen`)
        .setDescription(`Eigenen Geburtstag aus dem System entfernen`)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { options, guild, member } = interaction;

      if (interaction.options.getSubcommand() === "hinzufügen") {
        const birthdate = new Date(options.getString("date"));
        if (birthdate == "Invalid Date") {
          await interaction.reply({
            content: `❌ Dein Geburtsdatum ist kein reales Datum! ❌`,
            ephemeral: true
          });
          return resolve(null);
        }

        const now = new Date();

        const minimumYears = new Date().setFullYear(
          new Date().getFullYear() - 14
        );

        if (birthdate >= new Date(minimumYears)) {
          await interaction.reply({
            content: `❌ Du bist leider noch keine 14 Jahre alt. Sry. ❌`,
            ephemeral: true
          });
          return resolve(null);
        }

        let userData = await usersRepository.getUser(member.id, guild.id);

        if (!userData) {
          await interaction.reply({
            content: `❌ Wir haben leider noch keinerlei Einträge zu dir. Schreib erstmal eine Nachricht und versuche es dann erneut! ❌`,
            ephemeral: true
          });
          return resolve(null);
        }

        await interaction.reply({
          content: `Hey ${member} :) Dein Geburtstag wurde vermerkt. Wir freuen uns dir, an deinem ganz besonderen Tag, zu gratulieren`,
          ephemeral: true
        });

        await usersRepository.updateUser(
          guild.id,
          member.id,
          "birthdate",
          birthdate
        );
      }

      if (interaction.options.getSubcommand() === "entfernen") {
        await interaction.reply({
          content: `❌ Hier passiert NOCH nichts. WIP :) ❌`,
          ephemeral: true
        });
        return resolve(null);
      }

      return resolve(null);
    });
  }
};
