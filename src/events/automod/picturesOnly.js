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

      const pictureChannelIds = ["432528120688672768", "994975620008263722"];
      if (
        pictureChannelIds.includes(message.channel.id) &&
        message.attachments.size == 0
      ) {
        await message.delete();

        const answer = await message.channel.send(
          `Sry ${message.member} 🙂 In diesem Channel sind nur Bilder erlaubt. Du kannst jedoch einen öffentlichen Thread erstellen!`
        );
        try {
          setTimeout(function() {
            answer.delete()
          }, 10000);
        } catch (error) {}

        return resolve(null);
      }

      return resolve(null);
    });
  }
};
