const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
  } = require("discord.js");
  
  const levelsRepository = require("../../mysql/levelsRepository");
  
  module.exports = {
    name: "sup",
    category: "info",
    description: "Luedenscheid Support Befehle",
    data: new SlashCommandBuilder()
      .setName(`sup`)
      .setDescription(`Luedenscheid Support Befehle`)
      .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
      .setDMPermission(false)
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`fehlercode`)
          .setDescription(`Informationen zu Fehlercodes`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`bodenbug`)
          .setDescription(`Informationen zum Bodenbug`)
      ),
  
    async execute(interaction, client) {
      return new Promise(async (resolve) => {
        await interaction.deferReply({
          ephemeral: false,
          fetchReply: true
        });
  
        const { member, guild } = interaction;
  
        // ########################## INFO LEVEL SYSTEM ########################## \\
        if (interaction.options.getSubcommand() === "fehlercode") {
            const reportSystemEmbed = new EmbedBuilder()
              .setTitle(`❔ Luedenscheid Sup-System | Fehlercode`)
              .setDescription(
                `Du startest das Spiel und erhältst eine Fehlermeldung? Hier findest du unsere Fehlercodes, was sie bedeuten und ggf. eine Lösung:

                https://emergency-luedenscheid.de/wiki/entry/124-fehlercodes/`
              )
              .setColor(0x0fbaff)
              .setTimestamp(Date.now())
              .setImage(`https://emergency-luedenscheid.de/media/510-im-a-teapot-jpg/`)
              .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `powered by Powerbot`
              });
    
            interaction.editReply({
              ephemeral: false,
              embeds: [reportSystemEmbed]
            });
    
            const commandLogRepository = require("../../mysql/commandLogRepository");
            // guild - command, user, affectedMember, reason
            commandLogRepository.logCommandUse(
              interaction.guild,
              "lds-sup Fehlercode",
              interaction.user,
              member.user,
              "-"
            );
            return resolve(null);
          }
  
        if (interaction.options.getSubcommand() === "bodenbug") {
          const reportSystemEmbed = new EmbedBuilder()
            .setTitle(`❔ Luedenscheid Sup-System | Boden-Bug`)
            .setDescription(
              `Das Problem mit dem Boden ist ein alt bekanntes Thema. Alle Informationen (z.B. wie du es für dich verbessern kannst) findest du hier:

              https://emergency-luedenscheid.de/wiki/entry/65-map-fehler-boden-wird-durchsichtig/`
            )
            .setColor(0x0fbaff)
            .setTimestamp(Date.now())
            .setImage(`https://emergency-luedenscheid.de/media/313-mod-mapfail-png/?thumbnail=large`)
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            });
  
          interaction.editReply({
            ephemeral: false,
            embeds: [reportSystemEmbed]
          });
  
          const commandLogRepository = require("../../mysql/commandLogRepository");
          // guild - command, user, affectedMember, reason
          commandLogRepository.logCommandUse(
            interaction.guild,
            "lds-sup Bodenbug",
            interaction.user,
            member.user,
            "-"
          );
          return resolve(null);
        }
  
        return resolve(null);
      });
    }
  };
  