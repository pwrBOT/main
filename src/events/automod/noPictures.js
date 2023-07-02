const { PermissionsBitField } = require("discord.js");
const guildSettings = require("../../mysql/guildsRepository");
const warnSystem = require("../../functions/warningSystem/warnings");
const ms = require("ms");

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

      let nopictureChannel = await guildSettings.getGuildSetting(
        message.guild,
        "noPicturesChannel"
      );

      if (!nopictureChannel || nopictureChannel == "[]" || nopictureChannel == null) {
        return resolve(null);
      }

      const nopictureChannelIds = nopictureChannel.value

      if (
        nopictureChannelIds.includes(message.channel.id) &&
        message.attachments.size == 1
      ) {
        await message.delete().catch(error => {});

        const answer = await message.channel.send(
          `Sry ${message.member} 🙂 In diesem Channel sind keine Bilder erlaubt!`
        );
        try {
          setTimeout(function() {
            answer.delete().catch(error => {})
          }, 10000);
        } catch (error) {}

        return resolve(null);
      }

      return resolve(null);
    });
  }
};
