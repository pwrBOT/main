const {
  VoiceState,
  PermissionFlagsBits,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const tempCommandRepository = require("../../mysql/tempCommandRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */

  async execute(oldState, newState, client) {
    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;
    const guild = client.guilds.cache.get(newState.guild.id);
    const member = guild.members.cache.get(newState.id);
    const oldChannel = oldState.guild.channels.fetch(oldChannelId);
    const newChannel = newState.guild.channels.fetch(newChannelId);

    const tempChannelCheck = await tempChannelsRepository.getTempVoiceChannel(
      guild.id,
      newChannelId,
      "master"
    );
    if (!tempChannelCheck) {
      return;
    }

    const joinToCreate = tempChannelCheck.guildChannelId;
    const newChannelName = `Einsatzraum #${member.user.username}`;

    if (oldChannel !== newChannel && newChannelId === joinToCreate) {
      const voiceChannel = await guild.channels.create({
        name: newChannelName,
        type: ChannelType.GuildVoice,
        bitrate: "25600",
        parent: newState.channel.parent,
        permissionOverwrites: [
          {
            id: member.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
            ],
          },
        ],
      });
      console.log(guild.id);
      console.log(voiceChannel.id);
      await tempChannelsRepository.addTempVoiceChannel(
        guild.id,
        voiceChannel.id,
        "temp"
      );
      client.voiceGenerator.set(member.user.id, voiceChannel.id);
      setTimeout(() => member.voice.setChannel(voiceChannel), 500);
    }
  },
};
