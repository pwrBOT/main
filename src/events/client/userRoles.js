const { EmbedBuilder } = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    const userRolesChanged = new EmbedBuilder()
      .setTitle(`⚡️ PowerBot ⚡️ | Logging`)
      .setThumbnail(oldMember.displayAvatarURL())
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `powered by PowerBot`,
      });

    const removedRoles = await oldMember.roles.cache.filter(
      (role) => !newMember.roles.cache.has(role.id)
    );
    if (removedRoles.size > 0) {
      userRolesChanged
        .setDescription(`Die Rollen von ${oldMember} haben sich verändert!`)
        .setColor("Red")
        .addFields([
          {
            name: `Entfernte Rollen:`,
            value: `⛔️ ${removedRoles.map((r) => r.name)}`,
            inline: true,
          },
        ]);

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        oldMember.guild,
        1
      );
      if (!guildSettings) {
        return;
      }

      const modLogChannel = guildSettings.botLog;
      if (!modLogChannel) {
        console.log(
          `Kein ModLog Channel bei ${oldMember.guild.name} definiert!`
        );
      } else {
        client.channels.cache
          .get(modLogChannel)
          .send({ embeds: [userRolesChanged] });
      }
      userRolesChanged
        .setThumbnail(oldMember.guild.iconURL())
        .setDescription(
          `Deine Rollen bei ${oldMember.guild.name} haben sich verändert`
        );
      if ((oldMember.user.bot == true)) {
        return;
      }
      oldMember.send({ embeds: [userRolesChanged] }).catch(console.error);
      
    }

    // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
    const addedRoles = await newMember.roles.cache.filter(
      (role) => !oldMember.roles.cache.has(role.id)
    );
    if (addedRoles.size > 0) {
      userRolesChanged
        .setDescription(`Die Rollen von ${newMember} haben sich verändert!`)
        .setColor("Green")
        .addFields([
          {
            name: `Hinzugefügte Rollen:`,
            value: `✅ ${addedRoles.map((r) => r.name)}`,
            inline: true,
          },
        ]);

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        newMember.guild,
        1
      );
      if (!guildSettings) {
        return;
      }

      const modLogChannel = guildSettings.botLog;
      if (!modLogChannel) {
        console.log(
          `Kein ModLog Channel bei ${newMember.guild.name} definiert!`
        );
      } else {
        client.channels.cache
          .get(modLogChannel)
          .send({ embeds: [userRolesChanged] });
      }
      userRolesChanged
        .setThumbnail(oldMember.guild.iconURL())
        .setDescription(
          `Deine Rollen bei ${newMember.guild.name} haben sich verändert`
        );
      if ((newMember.user.bot == true)) {
        return;
      }
      newMember.send({ embeds: [userRolesChanged] }).catch(console.error);
    }
  },
};
