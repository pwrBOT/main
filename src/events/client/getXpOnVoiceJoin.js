const { VoiceState, PermissionFlagsBits, ChannelType } = require("discord.js");
const levelsRepository = require("../../mysql/levelsRepository");
const usersRepository = require("../../mysql/usersRepository");

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
      const guild = client.guilds.cache.get(newState.guild.id);
      const member = guild.members.cache.get(newState.id);
      const guildId = guild.id;
      const getUser = await usersRepository.getUser(member.user.id, guildId);
      const levelSettings = await levelsRepository.getlevelSettings(guild);
      const channelTimeXPCategoryIds = levelSettings.channelTimeXPCategoryIds;

      if (!getUser) {
        return resolve(null);
      }

      if (member.user.bot == true) {
        return resolve(null);
      }

      // USER JOINED CHANNEL
      if (oldChannelId === null && newChannelId !== null) {
        const currentChannel = await client.channels.cache.get(newChannelId);

        if (channelTimeXPCategoryIds.includes(currentChannel.parentId)) {
          if (getUser.lastChannelJoin.length !== 0) {
            await usersRepository.setlastChannelJoin(
              guildId,
              member.user.id,
              ""
            );
            console.log(`User in DB vorhanden: ${member.user.username}`);
          } else {
            const joinTime = new Date();
            await usersRepository.setlastChannelJoin(
              guildId,
              member.user.id,
              joinTime
            );
          }
        }
      }

      // USER LEFT CHANNEL
      if (oldChannelId !== null && newChannelId === null) {
        if (getUser.lastChannelJoin.length !== 0) {
          // TIME DIFFERENCE CALCUALTION
          const currentTime = new Date();
          var timeDifference =
            (currentTime.getTime() -
              new Date(getUser.lastChannelJoin).getTime()) /
            1000;
          timeDifference /= 60;
          Math.abs(Math.round(timeDifference));

          const minutesInChannel = timeDifference.toFixed(0);

          // GIVE USER XP
          let currentXP = getUser.xP;
          if (!currentXP) {
            currentXP = 0;
          }

          let XP = 0;
          if (minutesInChannel * 2 >= 400) {
            XP = 400;
          } else {
            XP = minutesInChannel * 2;
          }

          let newXP = currentXP + XP;
          let currentLevel = getUser.Level;
          let newLevel = getUser.Level;
          let requiredXP = newLevel * newLevel * 100 + 100;

          while (requiredXP <= newXP) {
            newLevel += 1;
            requiredXP = newLevel * newLevel * 100 + 100;
          }

          await usersRepository.addUserXP(guild.id, member.user, newXP);
          await usersRepository.addUserLevel(guild.id, member.user, newLevel);
          await usersRepository.setlastChannelJoin(guildId, member.user.id, "");

          console.log(
            `USER: ${member.user
              .username} XP: ${currentXP} + ${XP} = ${newXP} | Zeit im Channel: ${minutesInChannel}`
          );
        }
      }
    });
  }
};
