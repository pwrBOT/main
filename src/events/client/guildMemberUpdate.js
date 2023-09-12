const { EmbedBuilder } = require("discord.js");
const guildsRepository = require("../../mysql/guildsRepository");
const logChannel = require("../../mysql/loggingChannelsRepository");
const usersRepository = require("../../mysql/usersRepository");
const updateMap = new Map()

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    return new Promise(async resolve => {
      const memberId = oldMember.id || newMember.id;
      const guild = oldMember.guild || newMember.guild;
      const member = await guild.members
        .fetch({ user: memberId, cache: false })
        .catch(error => {});

      if (member.user.bot === true || member.user.bot === true) {
        return resolve(null);
      }

      const userMapId = guild.id + memberId

      if (updateMap.has(userMapId)) {
        return resolve(null)
      } else {
        updateMap.set(userMapId)
      }

      setTimeout(async function() {
        // #######################  UPDATE ROLES  ####################### \\
        const guildMemberUpdateEmbed = new EmbedBuilder()
          .setTitle(`⚡️ Logging ⚡️`)
          .setThumbnail(member.displayAvatarURL())
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by PowerBot`
          });

        const removedRoles = await oldMember.roles.cache.filter(
          role => !newMember.roles.cache.has(role.id)
        );

        if (removedRoles.size > 0) {
          guildMemberUpdateEmbed
            .setDescription(
              `Die Rollen von <@${member.id}> haben sich verändert!`
            )
            .setColor("Red")
            .addFields([
              {
                name: `Entfernte Rollen:`,
                value: `⛔️ ${removedRoles.map(r => r.name)}`,
                inline: false
              }
            ]);
        }

        // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
        const addedRoles = await newMember.roles.cache.filter(
          role => !oldMember.roles.cache.has(role.id)
        );

        if (addedRoles.size <= 0 && removedRoles.size > 0) {
          await logChannel.logChannel(
            oldMember.guild,
            "botLog",
            guildMemberUpdateEmbed
          );

          guildMemberUpdateEmbed
            .setThumbnail(member.guild.iconURL())
            .setDescription(
              `Deine Rollen bei ${member.guild.name} haben sich verändert`
            );
          if (member.user.bot == true) {
          }
          try {
            member
              .send({ embeds: [guildMemberUpdateEmbed] })
              .catch(error => {});
          } catch (error) {}
        }

        const communityRoleId = await guildsRepository.getGuildSetting(
          member.guild,
          "communityrole"
        );

        let isCommunitryRole = false;

        if (communityRoleId) {
          const communityRoleIds = JSON.parse(communityRoleId.value);
          await communityRoleIds.forEach(communityRoleId => {
            if (addedRoles.has(communityRoleId)) {
              isCommunitryRole = true;
            }
          });
        }

        if (addedRoles.size > 0 && isCommunitryRole == false) {
          guildMemberUpdateEmbed
            .setDescription(
              `Die Rollen von <@${member.id}> haben sich verändert!`
            )
            .setColor("Green")
            .addFields([
              {
                name: `Hinzugefügte Rollen:`,
                value: `✅ ${addedRoles.map(r => r.name)}`,
                inline: false
              }
            ]);

          await logChannel.logChannel(
            newMember.guild,
            "botLog",
            guildMemberUpdateEmbed
          );

          guildMemberUpdateEmbed
            .setThumbnail(member.guild.iconURL())
            .setDescription(
              `Deine Rollen bei ${member.guild.name} haben sich verändert`
            );
          if (member.user.bot == true) {
          }
          try {
            member
              .send({ embeds: [guildMemberUpdateEmbed] })
              .catch(error => {});
          } catch (error) {}
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
              `<@${member.id}> hat seinen Nickname von "${oldmemberName}" zu "${newmemberName}" geändert.`
            )
            .setColor("Green");

          await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);

          await usersRepository.updateUser(
            guild.id,
            member.id,
            "username",
            newMember.user.username
          );
        }

        // #######################  UPDATE USER TAG  ####################### \\

        if (newMember.user.username !== oldMember.user.username) {
          guildMemberUpdateEmbed
            .setDescription(
              `<@${member.id}> hat seinen User-TAG von "${oldMember.user
                .username}" zu "${newMember.user.username}" geändert.`
            )
            .setColor("Green");

          await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);

          await usersRepository.updateUser(
            guild.id,
            member.id,
            "username",
            newMember.user.username
          );
        }

        // #######################  UPDATE AVATAR  ####################### \\

        if (newMember.displayAvatarURL() !== oldMember.displayAvatarURL()) {
          guildMemberUpdateEmbed
            .setDescription(`<@${member.id}> hat seinen Avatar geändert.`)
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

        // #######################  TIMEOUT ADD / REMOVE  ####################### \\
        if (
          !oldMember.communicationDisabledUntil &&
          newMember.communicationDisabledUntil
        ) {
          let timeoutTimestamp =
            Date.parse(newMember.communicationDisabledUntil) / 1000;

          guildMemberUpdateEmbed
            .setDescription(
              `Neuer Timeout für <@${member.id}>
            Ablauf: <t:${timeoutTimestamp}>`
            )
            .setColor("Red");

          await logChannel.logChannel(guild, "botLog", guildMemberUpdateEmbed);
        }

        // #######################  BOOST FINDER  ####################### \\
        if (!oldMember.premiumSince && newMember.premiumSince) {
          const userBoostEmbed = new EmbedBuilder()
            .setTitle(`${member.displayName} ist nun Booster 💎`)
            .setColor(0xd503ff);

          const achievementChannel = await guildsRepository.getGuildSetting(
            newMember.guild,
            "achievementChannel"
          );

          if (achievementChannel) {
            if (achievementChannel.value) {
              try {
                const channel = await newMember.guild.channels.fetch(
                  achievementChannel.value
                );
                channel.send({ embeds: [userBoostEmbed] });
              } catch (error) {}
            }
          }
        }

        updateMap.delete(userMapId)

        return resolve(null);
      }, 6000);
    });
  }
};
