const { VoiceState, ChannelType } = require("discord.js");
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "voiceStateUpdate",

  async execute(oldState, newState, client) {
    return new Promise(async (resolve) => {
      const guild = oldState.guild || newState.guild;
      const member = oldState.member || newState.member;

      const oldChannel = oldState.channel;
      const newChannel = newState.channel;

      if (oldState) {
        const tempChannelCheckTemp =
          await tempChannelsRepository.getTempVoiceChannel(
            guild.id,
            oldState.channelId,
            "temp"
          );

        if (tempChannelCheckTemp) {
          tempChannelToDelete = await oldState.guild.channels
            .fetch(tempChannelCheckTemp.guildChannelId)
            .catch((error) => { });

          if (tempChannelToDelete) {
            if (tempChannelToDelete.members.size === 0) {
              deleteTempChannel(tempChannelToDelete);
            }
          }
        }
      }

      if (newState.channel) {
        const tempChannelCheck =
          await tempChannelsRepository.getTempVoiceChannel(
            guild.id,
            newState.channelId,
            "master"
          );

        if (tempChannelCheck) {
          await createTempChannel(tempChannelCheck);
        }
      }

      async function createTempChannel(tempChannelCheck) {
        const joinToCreate = tempChannelCheck.guildChannelId;
        const newChannelName = `${tempChannelCheck.tempChannelName} #${member.displayName}`;

        if (oldChannel !== newChannel && newState.channelId === joinToCreate) {
          let channelParent = "";
          if (tempChannelCheck.channelCategory) {
            channelParent = tempChannelCheck.channelCategory;
          } else {
            channelParent = newState.channel.parent;
          }

          let channelBitrate = "";

          const voiceChannel = await guild.channels
            .create({
              name: newChannelName,
              type: ChannelType.GuildVoice,
              bitrate: newChannel.guild.maximumBitrate,
              userLimit: newChannel.userLimit,
              parent: channelParent
            })
            .catch(console.error);

          try {
            setTimeout(() => member.voice.setChannel(voiceChannel), 200);
          } catch (error) { }

          try {
            setTimeout(async () => {
              if (tempChannelCheck.giveUserPermission == "yes") {
                await voiceChannel.permissionOverwrites
                  .edit(member, {
                    ManageChannels: true,
                    MoveMembers: true,
                    ManageMessages: true,
                    MuteMembers: false,
                    ViewChannel: true,
                    Connect: true,
                    Speak: true,
                    Stream: true
                  })
                  .catch((error) => { });
              }
            }, 2000);
          } catch (error) { }

          await tempChannelsRepository.addTempVoiceChannel(
            guild?.id,
            voiceChannel?.id,
            "temp",
            newChannelName,
            member.user.username,
            "-",
            "-"
          );
        }
      }

      function deleteTempChannel(tempChannelToDelete) {
        setTimeout(function () {
          tempChannelToDelete
            .delete("del temp channel")
            .catch((error) => { })
            .then(
              tempChannelsRepository
                .deleteTempVoiceChannel(guild.id, oldState.channelId, "temp")
                .then()
            );
        }, 250);
      }

      return resolve(null);
    });
  }
};
