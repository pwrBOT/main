const { VoiceState, PermissionFlagsBits, ChannelType } = require("discord.js");
const levelsRepository = require("../../mysql/levelsRepository");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const xPSystemGiveRole = require("../../functions/userManagement/xPSystemGiveRole");
const chalk = require("chalk");

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
      const userCheck = await usersRepository.getUser(member.user.id, guildId);
      const levelSettings = await levelsRepository.getlevelSettings(guild);
      const channelTimeXPCategoryIds = levelSettings.channelTimeXPCategoryIds;
      let channelXpBoostIds = [];
      if (levelSettings.channelXpBoostIds) {
        channelXpBoostIds = levelSettings.channelXpBoostIds;
      }

      let getUser;

      if (!userCheck) {
        console.log(
          chalk.yellow(
            `[MYSQL DATABASE] UserId: ${member.user
              .id} bei Guild: ${guildId} nicht gefunden. User wird angelegt...`
          )
        );
        await usersRepository.addUser(guildId, member.user);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] User (${member.user.username}#${member.user
              .discriminator} | ID: ${member.user
              .id}) bei Guild: ${guildId} erfolgreich angelegt!`
          )
        );
        getUser = await usersRepository.getUser(member.user.id, guildId);
      } else {
        getUser = await usersRepository.getUser(member.user.id, guildId);
      }

      if (member.user.bot == true) {
        return resolve(null);
      }

      const oldLevel = getUser.Level;

      // USER JOINED CHANNEL
      if (oldChannelId === null && newChannelId !== null) {
        const currentChannel = await client.channels.cache.get(newChannelId);
        const afkChannel = await guildsRepository.getGuildSetting(
          guild,
          "afkChannel"
        );
        let afkChannelId = "";
        if (afkChannel) {
          if (afkChannel.value.length != 0) {
            afkChannelId = afkChannel.value;
          }
        }

        if (channelTimeXPCategoryIds.includes(currentChannel.parentId)) {
            if (newChannelId == afkChannelId) {
            } else {
              const joinTime = new Date();
              await usersRepository.updateUser(
                guildId,
                member.user.id,
                "lastChannelJoin",
                joinTime
              );
            }
        }
      }

      // USER LEFT CHANNEL
      if (oldChannelId !== null && newChannelId === null) {
        userLeftChannel();
      }

      // USER CHANGED CHANNEL
      if (oldChannelId !== null && newChannelId !== null) {
        const currentChannel = await client.channels.cache.get(newChannelId);
        const afkChannel = await guildsRepository.getGuildSetting(
          guild,
          "afkChannel"
        );
        let afkChannelId = "";
        if (afkChannel) {
          if (afkChannel.value.length != 0) {
            afkChannelId = afkChannel.value;
          }
        }

        if (!channelTimeXPCategoryIds.includes(currentChannel.parentId)) {
          userLeftChannel();
        } else if (afkChannel) {
          if (newChannelId == afkChannel.value) {
            userLeftChannel();
          } else {
            if (getUser.lastChannelJoin.length !== 0) {
            } else {
              const joinTime = new Date();
              await usersRepository.updateUser(
                guildId,
                member.user.id,
                "lastChannelJoin",
                joinTime
              );
            }
          }
        }
      }

      // FUNCTIONS
      async function userLeftChannel() {
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

          let oldChannel = "";
          if (oldState) {
            oldChannel = await client.channels.cache.get(oldChannelId);
          } else {
            oldChannel = await client.channels.cache.get(newChannelId);
          }
          if (channelXpBoostIds.includes(oldChannel.parentId)) {
            if (minutesInChannel * 2 >= 400) {
              XP = 400;
            } else {
              XP = minutesInChannel * 2;
            }
          } else {
            if (minutesInChannel * 1 >= 200) {
              XP = 200;
            } else {
              XP = minutesInChannel * 1;
            }
          }

          let newXP = currentXP + XP;
          let newLevel = getUser.Level;
          let requiredXP = newLevel * newLevel * 100 + 100;

          while (requiredXP <= newXP) {
            newLevel += 1;
            requiredXP = newLevel * newLevel * 100 + 100;
          }

          let newMinutesInChannel = 0;
          newMinutesInChannel =
            getUser.totalVoiceTime + parseInt(minutesInChannel);

          await usersRepository.updateUser(
            guildId,
            member.user.id,
            "xP",
            newXP
          );
          await usersRepository.updateUser(
            guildId,
            member.user.id,
            "Level",
            newLevel
          );
          await usersRepository.updateUser(
            guildId,
            member.user.id,
            "lastChannelJoin",
            ""
          );
          await usersRepository.updateUser(
            guildId,
            member.user.id,
            "totalVoiceTime",
            newMinutesInChannel
          );

          await xPSystemGiveRole.autoUserRoles(guild, member, oldLevel);
          
          const loggingHandler = require("../../functions/fileLogging/loggingHandler");
          const logText = `GUILD: ${member.guild.id} | USER: ${member.displayName} (ID: ${member.id}) XP: ${currentXP} + ${XP} = ${newXP} | Zeit im Channel: ${minutesInChannel} | Total: ${newMinutesInChannel}`;
          loggingHandler.log(logText, "xP_logging");
        }
      }
    });
  }
};
