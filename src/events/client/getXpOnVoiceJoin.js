const { VoiceState, PermissionFlagsBits, ChannelType } = require("discord.js");
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");
const usersRepository = require("../../mysql/usersRepository");
const xPWaitMap = new Map();

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

      if (!getUser) {
        return resolve(null);
      }

      if (member.user.bot == true) {
        return resolve(null);
      }

      if (newChannelId !== null && oldChannelId !== newChannelId) {
        // GIVE XP
        const WAITTIME = 150000;

        if (xPWaitMap.has(member.user.id)) {
          console.log(xPWaitMap);
          const userData = xPWaitMap.get(member.user.id);
          userData.timer = setTimeout(() => {
            xPWaitMap.delete(member.user.id);
          }, WAITTIME);
        } else {
          let currentXP = getUser.xP;
          if (!currentXP) {
            currentXP = 0;
          }
          let XP = Math.floor(Math.random() * (40 - 20 + 1)) + 10;
          var newXP = currentXP + XP;

          await usersRepository.addUserXP(guildId, member.user, newXP);
          const requiredXP = getUser.Level * getUser.Level * 100 + 100;

          let newLevel = "";

          if (newXP >= requiredXP) {
            newLevel = (getUser.Level += 1);
            await usersRepository.addUserLevel(guildId, member.user, newLevel);
          }

          xPWaitMap.set(member.user.id, {
            oldXP: getUser.xP,
            newXP: newXP,
            oldLevel: getUser.Level,
            newLevel: newLevel,
            timer: WAITTIME
          });
        }
        return resolve(null);
      }
    });
  }
};
