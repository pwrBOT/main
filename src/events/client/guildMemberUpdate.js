const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    return new Promise(async (resolve) => {
      const { guild, user } = newMember;
      const logChannel = require("../../mysql/loggingChannelsRepository");

      // #######################  UPDATE ROLES  ####################### \\
      const guildMemberUpdateEmbed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot ⚡️ | Logging`)
        .setThumbnail(oldMember.displayAvatarURL())
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`
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
              inline: true
            }
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
              inline: true
            }
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

      // #######################  UPDATE BOOST  ####################### \\
      if (oldMember.premiumSince !== newMember.premiumSince) {
        const oldStatus = oldMember.premiumSince;
        const newStatus = newMember.premiumSince;

        const logChannel = require("../../mysql/loggingChannelsRepository");
          await logChannel.logChannel(
            newMember.guild,
            "botLog",
            guildMemberUpdateEmbed
          );


        console.log(oldStatus);
        console.log(newStatus);

        if (!oldStatus && newStatus) {
          console.log(
            `${newMember.guild.name} wird von ${newMember.user.tag} geboostet!`
          );

          guildMemberUpdateEmbed
            .setDescription(`${newMember} Boostet nun den Server 💎`)
            .setColor("Yellow");
          await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);

          let donatorRoleId = await guildSettings.getGuildSetting(
            message.guild,
            "donatorRole"
          );

          if (donatorRoleId.value.length === 0) {
          } else {
            let donatorRole = guild.roles.cache.get(donatorRoleId.value);
            await newMember.roles.add(donatorRole).catch(console.error);
          }
        }

        if (oldStatus && !newStatus) {
          console.log(
            `${oldMember.guild.name} wird von ${oldMember.user.tag} geboostet!`
          );

          guildMemberUpdateEmbed
            .setDescription(`${newMember} boostet den Server nicht mehr ☹️`)
            .setColor("Red");
          await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);

          let donatorRoleId = await guildSettings.getGuildSetting(
            message.guild,
            "donatorRole"
          );

          if (donatorRoleId.value.length === 0) {
          } else {
            let donatorRole = guild.roles.cache.get(donatorRoleId.value);
            await newMember.roles.remove(donatorRole).catch(console.error);
          }
        }
      }

      // #######################  UPDATE NICKNAME  ####################### \\

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

      // #######################  UPDATE AVATAR  ####################### \\

      if (newMember.displayAvatarURL() !== oldMember.displayAvatarURL()) {
        guildMemberUpdateEmbed
          .setDescription(`${newMember} hat seinen Avatar geändert.`)
          .setColor("Green")
          .setThumbnail(newMember.displayAvatarURL())
          .addFields([
            {
              name: `Avatar alt:`,
              value: `[LINK](${oldMember.displayAvatarURL()})`,
              inline: true
            },
            {
              name: `Avatar neu:`,
              value: `[LINK](${newMember.displayAvatarURL()})`,
              inline: true
            }
          ]);
        await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);
      }

      return resolve(null);
    });
  }
};
