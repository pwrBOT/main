const { VoiceState, PermissionFlagsBits, ChannelType } = require("discord.js");
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

    if (oldState) {
      const tempChannelCheckTemp =
        await tempChannelsRepository.getTempVoiceChannel(
          guild.id,
          oldChannelId,
          "temp"
        );

        console.log(tempChannelCheckTemp)
        console.log(oldState)

      if (tempChannelCheckTemp) {
        tempChannelToDelete =
          oldState.guild.channels.fetch(tempChannelCheckTemp);

        console.log(tempChannelToDelete);

        oldState.guild.channels
          .delete(tempChannelToDelete)
          .then(console.log)
          .catch(console.error);

        await tempChannelsRepository.getTempVoiceChannel(
          oldState.guild.id,
          oldChannelId,
          "temp"
        );
        return;
      }
    }

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
      await tempChannelsRepository.addTempVoiceChannel(
        guild.id,
        voiceChannel.id,
        "temp",
        "no"
      );
      client.voiceGenerator.set(member.user.id, voiceChannel.id);
      setTimeout(() => member.voice.setChannel(voiceChannel), 500);
    }
  },
};
