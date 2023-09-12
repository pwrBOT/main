const { EmbedBuilder } = require("discord.js");
const teamlistRepository = require("../../mysql/teamlistRepository");

const updateTeamlist = async (
  client,
  guild,
  member,
  removedRoles,
  addedRoles,
  teamlistSettings,
  deleteStatus
) => {
  return new Promise(async (resolve) => {
    if (teamlistSettings) {
      const teamListRoles =
        teamlistSettings.teamroleId1 +
        ", " +
        teamlistSettings.teamroleId2 +
        ", " +
        teamlistSettings.teamroleId3 +
        ", " +
        teamlistSettings.teamroleId4 +
        ", " +
        teamlistSettings.teamroleId5;

      const teamlistChannel = await guild.channels.fetch(
        teamlistSettings.teamlistChannelId
      );
      const teamlistMessage = await teamlistChannel.messages
        .fetch(teamlistSettings.messageId)
        .catch((error) => {});

      let status = false

      if (deleteStatus === true) {
        status = true
      }

      await removedRoles.forEach((role) => {
        if (teamListRoles.includes(role.id)) {
          const newTeamMemberEmbed = new EmbedBuilder()
            .setTitle(`👥 Team Änderung`)
            .setDescription(`${member} ist nicht mehr als ${role} tätig`)
            .setColor(0x0073ff)
            .setTimestamp(Date.now())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            });

          teamlistChannel
            .send({ embeds: [newTeamMemberEmbed] })
            .catch((error) => {});

            status = true
        } else {
          return resolve(null);
        }
      });

      await addedRoles.forEach((role) => {
        if (teamListRoles.includes(role.id)) {
          const newTeamMemberEmbed = new EmbedBuilder()
            .setTitle(`👥 Neues Team-Mitglied`)
            .setDescription(`${member} verstärkt das Team als ${role} 🤙`)
            .setColor(0x0073ff)
            .setTimestamp(Date.now())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            });

          teamlistChannel
            .send({ embeds: [newTeamMemberEmbed] })
            .catch((error) => {});

            status = true
        } else {
          return resolve(null);
        }
      });

      if (status === false) {
        return resolve(null);
      }

      const teamRole1 =
        (await guild.roles
          .fetch(teamlistSettings.teamroleId1)
          .catch((error) => {})) || "-";
      const teamRole2 =
        (await guild.roles
          .fetch(teamlistSettings.teamroleId2)
          .catch((error) => {})) || "-";
      const teamRole3 =
        (await guild.roles
          .fetch(teamlistSettings.teamroleId3)
          .catch((error) => {})) || "-";
      const teamRole4 =
        (await guild.roles
          .fetch(teamlistSettings.teamroleId4)
          .catch((error) => {})) || "-";
      const teamRole5 =
        (await guild.roles
          .fetch(teamlistSettings.teamroleId5)
          .catch((error) => {})) || "-";

      let teamRoleMember1 = "";
      let teamRoleMember2 = "";
      let teamRoleMember3 = "";
      let teamRoleMember4 = "";
      let teamRoleMember5 = "";

      const sorting = (a, b) => {
        return a.joinedTimestamp - b.joinedTimestamp;
      };

      const sortedTeamRoleMembers1 = await teamRole1.members.sort(sorting);
      sortedTeamRoleMembers1.forEach(async (member) => {
        if (teamRole1.rawPosition === member.roles.highest.rawPosition) {
          teamRoleMember1 += `👤 [${member.displayName}](https://discordapp.com/users/${member.id})\n`;
        }
      });

      const sortedTeamRoleMembers2 = await teamRole2.members.sort(sorting);
      sortedTeamRoleMembers2.forEach((member) => {
        if (teamRole2.rawPosition === member.roles.highest.rawPosition) {
          teamRoleMember2 += `👤 [${member.displayName}](https://discordapp.com/users/${member.id})\n`;
        }
      });

      const sortedTeamRoleMembers3 = await teamRole3.members.sort(sorting);
      sortedTeamRoleMembers3.forEach((member) => {
        if (teamRole3.rawPosition === member.roles.highest.rawPosition) {
          teamRoleMember3 += `👤 [${member.displayName}](https://discordapp.com/users/${member.id})\n`;
        }
      });

      if (teamRole4 != "-") {
        const sortedTeamRoleMembers4 = await teamRole4.members.sort(sorting);
        sortedTeamRoleMembers4.forEach((member) => {
          if (teamRole4.rawPosition === member.roles.highest.rawPosition) {
            teamRoleMember4 += `👤 [${member.displayName}](https://discordapp.com/users/${member.id})\n`;
          }
        });
      }

      if (teamRole5 != "-") {
        const sortedTeamRoleMembers5 = await teamRole5.members.sort(sorting);
        sortedTeamRoleMembers5.forEach((member) => {
          if (teamRole5.rawPosition === member.roles.highest.rawPosition) {
            teamRoleMember5 += `👤 [${member.displayName}](https://discordapp.com/users/${member.id})\n`;
          }
        });
      }

      const newEmbed = new EmbedBuilder()
        .setTitle(`${guild.name} | 👥 Team Übersicht:`)
        .setColor(0x0073ff)
        .setTimestamp(Date.now())
        .setThumbnail(guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        });

      if (teamRoleMember1.length != 0) {
        newEmbed.addFields({
          name: `**${teamRole1.name}:**`,
          value: `${teamRoleMember1}`,
          inline: false
        });
      }
      if (teamRoleMember2.length != 0) {
        newEmbed.addFields({
          name: `**${teamRole2.name}:**`,
          value: `${teamRoleMember2}`,
          inline: false
        });
      }
      if (teamRoleMember3.length != 0) {
        newEmbed.addFields({
          name: `**${teamRole3.name}:**`,
          value: `${teamRoleMember3}`,
          inline: false
        });
      }
      if (teamRoleMember4.length != 0) {
        newEmbed.addFields({
          name: `**${teamRole4.name}:**`,
          value: `${teamRoleMember4}`,
          inline: false
        });
      }
      if (teamRoleMember5.length != 0) {
        newEmbed.addFields({
          name: `**${teamRole5.name}:**`,
          value: `${teamRoleMember5}`,
          inline: false
        });
      }

      if (teamlistMessage) {
        await teamlistMessage.delete().catch((error) => {});
      }
      const newTeamlistMessage = await teamlistChannel
        .send({ embeds: [newEmbed] })
        .catch((error) => {});

      await teamlistRepository.updateTeamlistSettings(
        guild,
        "messageId",
        newTeamlistMessage.id
      );

      return resolve(null);
    }
    return resolve(null);
  });
};

module.exports.updateTeamlist = updateTeamlist;
