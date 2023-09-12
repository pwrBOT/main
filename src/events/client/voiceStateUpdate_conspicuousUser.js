const {
  VoiceState,
  ChannelType,
  EmbedBuilder,
  NewsChannel
} = require("discord.js");
const conspicuousUserRepository = require("../../mysql/conspicuousUserRepository");

module.exports = {
  name: "voiceStateUpdate",

  async execute(oldState, newState, client) {
    return new Promise(async (resolve) => {
      const guild = oldState.guild || newState.guild;
      const member = oldState.member || newState.member;

      if (newState && newState.channel && !oldState.channel) {
        const conspicuousUser = await conspicuousUserRepository.getEntry(
          guild.id,
          member.id,
          "active"
        );

        if (conspicuousUser === null) {
          return resolve(null);
        }

        const conspicuousUserEmbed = new EmbedBuilder()
          .setTitle(`⚡️ ${guild.name} | Verdächtiger User System ⚡️`)
          .setDescription(
            `${member} (${member.user.username}) hat einen Sprachchannel betreten!`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Sprachchannel:`,
              value: `${newState.channel}`,
              inline: true
            },
            {
              name: `Markiert durch:`,
              value: `${conspicuousUser.modName}`,
              inline: true
            },
            {
              name: `Grund der Markierung:`,
              value: `${conspicuousUser.reason}\n`,
              inline: false
            },
          ]);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(guild, "botLog", conspicuousUserEmbed);
      }

      return resolve(null);
    });
  }
};
