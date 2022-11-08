const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
module.exports = {
  data: {
    name: `report_erledigt`,
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true,
      });

      const guildSettings = require("../../mysql/guildsRepository");
      const modRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modRole"
      );
      if (!modRoleId) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Keine Moderator-Rolle definiert! ❌",
        });
        return resolve(null);
      }

      let isModerator = false;

      const modRoleIds = JSON.parse(modRoleId.value);
      modRoleIds.forEach((modRoleId) => {
        if (interaction.member.roles.cache.has(modRoleId)) {
          isModerator = true;
        }
      });

      if (!isModerator) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Du bist kein Moderator! ❌",
        });
        return resolve(null);
      }

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report erledigt durch ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      await interaction.message.edit({
        components: [new ActionRowBuilder().addComponents(buttonErledigt)],
      });

      // LOCK AND ARCHIVE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (!modThreadAreaId.value) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt!`,
        });
        return resolve(null);
      }

      const modThreadArea = await interaction.guild.channels.cache.get(
        modThreadAreaId.value
      );
      const threadName = `Report | Mod ${interaction.member.user.username}`;
      const thread = modThreadArea.threads.cache.find(
        (x) => x.name === threadName
      );

      if (!thread) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report erfolgreich erledigt! Kein Thread zum Löschen gefunden!`,
        });
        return resolve(null);
      }
      await thread.setLocked(true); // locked
      await thread.setArchived(true); // archived
      await interaction.editReply({
        ephemeral: true,
        content: `✅ Du hast den Report erfolgreich erledigt! Dein Thread wird automatisch geschlossen und archiviert.`,
      });

      // LOCK AND ARCHIVE PRIVATE THREAD END \\
      return resolve(null);
    });
  },
};
