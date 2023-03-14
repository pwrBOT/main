const { PermissionsBitField, messageLink } = require("discord.js");
const guildSettings = require("../../mysql/guildsRepository");
const warnSystem = require("../../functions/warningSystem/warnings");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    return new Promise(async resolve => {
      if (!message || message.author.bot || !message.member) {
        return resolve(null);
      }

      const commandChannelIds = ["1018087459013271564","978210408387198988"];
      if (commandChannelIds.includes(message.channel.id)) {
        if (
          message.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          )
        ) {
          return resolve(null);
        } else if (
          message.member.permissions.has(PermissionsBitField.Flags.KickMembers)
        ) {
          return resolve(null);
        } else {
          await message.delete();

          const answer = await message.channel.send(
            `Sry ${message.member} 🙂 In diesem Channel sind nur Commands erlaubt!`
          );
          setTimeout(function() {
            answer.delete();
          }, 10000);
        }
      }

      return resolve(null);
    });
  }
};
