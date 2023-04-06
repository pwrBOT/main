const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const monitoringRepository = require("../../mysql/monitoringRepository");

module.exports = {
  name: "monitoring",
  category: "admin",
  description: "Monitoring System | show / add / remove",
  data: new SlashCommandBuilder()
    .setName(`monitoring`)
    .setDescription(`Monitoring System: show / add / remove`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`show`)
        .setDescription(`Aktive Monitoring-URLs anzeigen lassen`)
    )
    .addSubcommand((subcommand) =>
      subcommand.setName(`add`).setDescription(`Monitoring-URL hinzufügen`)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { options, member, guild } = interaction;

      if (options.getSubcommand() === "show") {
        const monitoringDataArray = await monitoringRepository.get(guild.id);

        const monitoringEmbed = new EmbedBuilder()
          .setAuthor({
            name: `${guild.name}`,
            iconURL: `${guild.iconURL()}`
          })
          .setTitle(`🖥 Monitoring Übersicht`)
          .setColor(0x009cf7)
          .setTimestamp(Date.now());

        if (monitoringDataArray.length == 0) {
            monitoringEmbed.setDescription(`Kein Monitoring aktiv`)
        } else {
          for (const monitoringData of monitoringDataArray) {
            const monitoringChannel = await guild.channels.fetch(
              monitoringData.monitoringChannelId
            );

            let status = "";
            if (monitoringData.status == "UP") {
              status = `🟢`;
            } else {
              status = `🔴`;
            }

            monitoringEmbed.addFields([
              {
                name: `${status} ${monitoringData.name}:`,
                value: `Letzter Check: <t:${Date.parse(monitoringData.lastCheck)/ 1000}:F>
                Notification-Channel: ${monitoringChannel}`,
                inline: false
              }
            ]);
          }
        }

        await interaction.reply({ embeds: [monitoringEmbed], ephemeral: false });
        return resolve(null);
      }

      return resolve(null);
    });
  }
};
