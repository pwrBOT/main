const teamlistRepository = require("../../mysql/teamlistRepository");
const teamlist = require("../../functions/teamlist/teamlist");

module.exports = {
  name: "messageDeleteBulk",
  async execute(messages) {
    return new Promise(async (resolve) => {
      setTimeout(async function () {
        messages.forEach(async (message) => {
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

          await teamlist.updateTeamlist(
            message.client,
            message.guild,
            message.author,
            removedRoles,
            addedRoles,
            teamlistSettings,
            status
          );
        });
      }, 2000);

      return resolve(null);
    });
  }
};
