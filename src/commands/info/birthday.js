const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const birthdayCheck = require("../../events/cronjobs/birthdayCheck")

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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`geburtstagsliste`)
        .setDescription(`Erzwingt die Generierung der Geburtstagsliste`)
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

        if (userData.birthdate.getFullYear() < 1900) {
          await interaction.reply({
            content: `Dein Geburtstag wurde vermerkt 🥳`,
            ephemeral: true
          });

          await usersRepository.updateUser(
            guild.id,
            member.id,
            "birthdate",
            birthdate
          );
        } else {

          if (userData.birthdate.toLocaleDateString('de-DE') == birthdate.toLocaleDateString('de-DE')) {
            await interaction.reply({
              content: `Dein Geburtsdatum ist bereits eingetragen 🥳`,
              ephemeral: true
            });
            return resolve(null);
          }

          await interaction.reply({
            content: `Dein Geburtstag wurde aktualisiert 🥳\nVorher: ${userData.birthdate.toLocaleDateString('de-DE')} / Neu: ${birthdate.toLocaleDateString('de-DE')}`,
            ephemeral: true
          });

          await usersRepository.updateUser(
            guild.id,
            member.id,
            "birthdate",
            birthdate
          );
        }
      }

      if (interaction.options.getSubcommand() === "entfernen") {
        await interaction.reply({
          content: `❌ Hier passiert NOCH nichts. WIP :) ❌`,
          ephemeral: true
        });
        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "geburtstagsliste") {

        await birthdayCheck.generate(client)

        await interaction.reply({
          content: `TEST: Generierung der Geburtstagsliste angestoßen --> Siehe Console`,
          ephemeral: true
        });
        return resolve(null);
      }

      return resolve(null);
    });
  }
};
