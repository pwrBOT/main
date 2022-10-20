const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    return new Promise(async (resolve) => {
      const { guild, user } = newMember;
      const logChannel = require("../../mysql/loggingChannelsRepository");

      // DEFINE EMBED
      const guildMemberUpdateEmbed = new EmbedBuilder()
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
        guildMemberUpdateEmbed
          .setDescription(`Die Rollen von ${oldMember} haben sich verändert!`)
          .setColor("Red")
          .addFields([
            {
              name: `Entfernte Rollen:`,
              value: `⛔️ ${removedRoles.map((r) => r.name)}`,
              inline: true,
            },
          ]);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(
          oldMember.guild,
          "botLog",
          guildMemberUpdateEmbed
        );

        guildMemberUpdateEmbed
          .setThumbnail(oldMember.guild.iconURL())
          .setDescription(
            `Deine Rollen bei ${oldMember.guild.name} haben sich verändert`
          );
        if (oldMember.user.bot == true) {
          return resolve(null);
        }
        try {
          await oldMember.send({ embeds: [guildMemberUpdateEmbed] });
        } catch (error) {}
        return resolve(null);
      }

      // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
      const addedRoles = await newMember.roles.cache.filter(
        (role) => !oldMember.roles.cache.has(role.id)
      );
      if (addedRoles.size > 0) {
        guildMemberUpdateEmbed
          .setDescription(`Die Rollen von ${newMember} haben sich verändert!`)
          .setColor("Green")
          .addFields([
            {
              name: `Hinzugefügte Rollen:`,
              value: `✅ ${addedRoles.map((r) => r.name)}`,
              inline: true,
            },
          ]);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(
          newMember.guild,
          "botLog",
          guildMemberUpdateEmbed
        );

        guildMemberUpdateEmbed
          .setThumbnail(oldMember.guild.iconURL())
          .setDescription(
            `Deine Rollen bei ${newMember.guild.name} haben sich verändert`
          );
        if (newMember.user.bot == true) {
          return resolve(null);
        }
        try {
          await newMember.send({ embeds: [guildMemberUpdateEmbed] });
        } catch (error) {}
        return resolve(null);
      }

      if (newMember.nickname !== oldMember.nickname) {
        let oldmemberName = "";
        if (oldMember.nickname == null) {
          oldmemberName = oldMember.user.username;
        } else {
          oldmemberName = oldMember.nickname;
        }

        let newmemberName = "";
        if (newMember.nickname == null) {
          newmemberName = newMember.user.username;
        } else {
          newmemberName = newMember.nickname;
        }

        guildMemberUpdateEmbed
          .setDescription(
            `${newMember} hat seinen Nickname von "${oldmemberName}" zu "${newmemberName}" geändert.`
          )
          .setColor("Green");
        await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);
      }

      if (newMember.displayAvatarURL() !== oldMember.displayAvatarURL()) {
        guildMemberUpdateEmbed
          .setDescription(`${newMember} hat seinen Avatar geändert.`)
          .setColor("Green")
          .setThumbnail(newMember.displayAvatarURL())
          .addFields([
            {
              name: `Avatar alt:`,
              value: `[LINK](${oldMember.displayAvatarURL({
                size: "2048",
                dynamic: false,
              })})`,
              inline: true,
            },
            {
              name: `Avatar neu:`,
              value: `[LINK](${newMember.displayAvatarURL({
                size: "2048",
                dynamic: false,
              })})`,
              inline: true,
            },
          ]);
        await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);
      }

      return resolve(null);
    });
  },
};
