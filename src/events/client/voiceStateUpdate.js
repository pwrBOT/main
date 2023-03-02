const { VoiceState, ChannelType } = require("discord.js");
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */

  async execute(oldState, newState, client) {
    return new Promise(async resolve => {
      const oldChannelId = oldState.channelId;
      const newChannelId = newState.channelId;
      const guild = await client.guilds.cache.get(newState.guild.id);
      const member = await guild.members.cache.get(newState.id);
      const oldChannel = await oldState.guild.channels
        .fetch(oldChannelId)
        .catch(error => {});
      const newChannel = await newState.guild.channels
        .fetch(newChannelId)
        .catch(error => {});

      if (oldState) {
        const tempChannelCheckTemp = await tempChannelsRepository.getTempVoiceChannel(
          guild.id,
          oldChannelId,
          "temp"
        );

        if (tempChannelCheckTemp) {
          tempChannelToDelete = oldState.guild.channels.cache.get(
            tempChannelCheckTemp.guildChannelId
          );

          if (tempChannelToDelete) {
            if (tempChannelToDelete.members.size === 0) {
              try {
                setTimeout(async function() {
                  tempChannelToDelete.delete("del temp channel").catch(error => {});

                  await tempChannelsRepository.deleteTempVoiceChannel(
                    oldState.guild.id,
                    oldChannelId,
                    "temp"
                  );
                }, 1000);
              } catch (error) {}
            }
          }
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
      const newChannelName = `${tempChannelCheck.tempChannelName} #${member.user
        .username}`;

      if (oldChannel !== newChannel && newChannelId === joinToCreate) {
        let channelParent = "";
        if (tempChannelCheck.channelCategory) {
          channelParent = tempChannelCheck.channelCategory;
        } else {
          channelParent = newState.channel.parent;
        }

        const voiceChannel = await guild.channels
          .create({
            name: newChannelName,
            type: ChannelType.GuildVoice,
            bitrate: 384000,
            userLimit: newChannel.userLimit,
            parent: channelParent
          })
          .catch(console.error);


        try {
          setTimeout(() => member.voice.setChannel(voiceChannel), 200);
        } catch (error) {}

        if (tempChannelCheck.giveUserPermission == "yes") {
          await voiceChannel.permissionOverwrites.edit(member.id, {
            ManageChannels: true,
            MoveMembers: true,
            ManageMessages: true,
            MuteMembers: true
          }).catch(error => {});
        }

        await tempChannelsRepository.addTempVoiceChannel(
          guild.id,
          voiceChannel.id,
          "temp",
          newChannelName,
          member.user.username,
          "-",
          "-"
        );
        return resolve(null);
      }
    });
  }
};
