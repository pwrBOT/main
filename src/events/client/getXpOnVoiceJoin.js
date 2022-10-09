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

      if (newChannelId !== null && oldChannelId !== newChannelId) {
        // GIVE XP
        const guildId = guild.id;
        const getUser = await usersRepository.getUser(member.user.id, guildId);

        if (!getUser) {
          return resolve(null);
        }
        if (member.user.bot == true) {
          return resolve(null);
        }
        let currentXP = getUser.xP;
        if (!currentXP) {
          currentXP = 0;
        }
        let XP = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
        var newXP = currentXP + XP;
        await usersRepository.addUserXP(guildId, member.user, newXP);

        const requiredXP = getUser.Level * getUser.Level * 100 + 100;

        if (newXP >= requiredXP) {
          let newLevel = (getUser.Level += 1);
          await usersRepository.addUserLevel(guildId, member.user, newLevel);
        }

        return resolve(null);
      }
    });
  },
};
