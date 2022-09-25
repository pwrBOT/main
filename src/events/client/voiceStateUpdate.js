const { VoiceState, PermissionFlagsBits, ChannelType } = require("discord.js");
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");
const usersRepository = require("../../mysql/usersRepository");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */

  async execute(oldState, newState, client) {
    return new Promise(async (resolve) => {
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

        if (tempChannelCheckTemp) {
          tempChannelToDelete = oldState.guild.channels.cache.get(
            tempChannelCheckTemp.guildChannelId
          );

          if (tempChannelToDelete.members.size === 0) {
            tempChannelToDelete.delete("del temp channel").catch(console.error);

            await tempChannelsRepository.deleteTempVoiceChannel(
              oldState.guild.id,
              oldChannelId,
              "temp"
            );
            return resolve(null);
          }
          return resolve(null);
        }
      }

      const tempChannelCheck = await tempChannelsRepository.getTempVoiceChannel(
        guild.id,
        newChannelId,
        "master"
      );
      if (!tempChannelCheck) {
        return resolve(null);
      }

      const joinToCreate = tempChannelCheck.guildChannelId;
      const newChannelName = `${tempChannelCheck.tempChannelName} #${member.user.username}`;

      if (oldChannel !== newChannel && newChannelId === joinToCreate) {
        // const mainPermissions = newChannel.permissionOverwrites
        const voiceChannel = await guild.channels.create({
          name: newChannelName,
          type: ChannelType.GuildVoice,
          bitrate: 384000,
          parent: newState.channel.parent,
        });
        await tempChannelsRepository.addTempVoiceChannel(
          guild.id,
          voiceChannel.id,
          "temp",
          newChannelName,
          member.user.username,
          "-"
        );
        client.voiceGenerator.set(member.user.id, voiceChannel.id);
        setTimeout(() => member.voice.setChannel(voiceChannel), 250);
        
        return resolve(null);
      }
    });
  },
};
