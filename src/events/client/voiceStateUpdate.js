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
    return new Promise(async (resolve) => {
      const guild = oldState.guild || newState.guild
      const member = oldState.member || newState.member

      const oldChannel = oldState.channel
      const newChannel = newState.channel

      if (oldState) {
        const tempChannelCheckTemp =
          await tempChannelsRepository.getTempVoiceChannel(
            guild.id,
            oldState.channelId,
            "temp"
          );

        if (tempChannelCheckTemp) {
          tempChannelToDelete = await oldState.guild.channels.fetch(
            tempChannelCheckTemp.guildChannelId
          ).catch(error =>{});

          if (tempChannelToDelete) {
            if (tempChannelToDelete.members.size === 0) {
              try {
                setTimeout(async function () {
                  tempChannelToDelete
                    .delete("del temp channel")
                    .catch((error) => {});

                  await tempChannelsRepository.deleteTempVoiceChannel(
                    oldState.guild.id,
                    oldState.channelId,
                    "temp"
                  );
                }, 500);
              } catch (error) {}
            }
          }
        }
      }

      if (newState) {
        const tempChannelCheck =
          await tempChannelsRepository.getTempVoiceChannel(
            guild.id,
            newState.channelId,
            "master"
          );

        if (!tempChannelCheck) {
          return resolve(null);
        }

        const joinToCreate = tempChannelCheck.guildChannelId;
        const newChannelName = `${tempChannelCheck.tempChannelName} #${member.user.username}`;

        if (oldChannel !== newChannel && newState.channelId === joinToCreate) {
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
            await voiceChannel.permissionOverwrites
              .edit(member.id, {
                ManageChannels: true,
                MoveMembers: true,
                ManageMessages: true,
                MuteMembers: true
              })
              .catch((error) => {});
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
      }

      
    });
  }
};
