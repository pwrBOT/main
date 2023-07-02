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

      if (
        message.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        ) ||
        message.member.permissions.has(PermissionsBitField.Flags.KickMembers)
      ) {
        return resolve(null);
      }

      let commandChannel = await guildSettings.getGuildSetting(
        message.guild,
        "commandOnlyChannel"
      );

      if (!commandChannel || commandChannel == "[]" || commandChannel == null) {
        return resolve(null);
      }

      const commandChannelIds = commandChannel.value


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
          await message.delete().catch(error => {});

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
