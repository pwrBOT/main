const { EmbedBuilder } = require("discord.js");
const teamlistRepository = require("../../mysql/teamlistRepository");
const teamlist = require("../../functions/teamlist/teamlist");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    return new Promise(async (resolve) => {
      const memberId = oldMember.id || newMember.id;
      const guild = oldMember.guild || newMember.guild;
      const member = await guild.members
        .fetch({ user: memberId, cache: false })
        .catch((error) => {});

      if (member.user.bot === true) {
        return resolve(null);
      }

      const removedRoles = await oldMember.roles.cache.filter(
        (role) => !newMember.roles.cache.has(role.id)
      );

      const addedRoles = await newMember.roles.cache.filter(
        (role) => !oldMember.roles.cache.has(role.id)
      );

      const teamlistSettings = await teamlistRepository.getTeamlistSettings(
        guild
      );

      if (!teamlistSettings || teamlistSettings.status === 0) {
        return resolve(null)
      }

      await teamlist.updateTeamlist(client, guild, member, removedRoles, addedRoles, teamlistSettings)

      
      return resolve(null);
    });
  }
};
