const teamlistRepository = require("../../mysql/teamlistRepository");
const teamlist = require("../../functions/teamlist/teamlist");

module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    return new Promise(async (resolve) => {
      setTimeout(async function () {
      const teamlistSettings = await teamlistRepository.getTeamlistSettings(
        message.guild
      );

      if (!teamlistSettings || teamlistSettings.status === 0) {
        return resolve(null);
      }

      if (teamlistSettings.messageId != message.id) {
        return resolve(null);
      }

      const removedRoles = new Map();
      const addedRoles = new Map();

      const status = true

        teamlist.updateTeamlist(
          message.client,
          message.guild,
          message.author,
          removedRoles,
          addedRoles,
          teamlistSettings,
          status
        );
      }, 2000);

      return resolve(null);
    });
  }
};
