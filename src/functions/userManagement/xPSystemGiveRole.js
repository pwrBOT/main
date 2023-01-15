const { EmbedBuilder } = require("discord.js");
const usersRepository = require("../../mysql/usersRepository");
const levelsRepository = require("../../mysql/levelsRepository");

async function autoUserRoles(guild, member, oldLevel) {
  return new Promise(async resolve => {
    if (guild == null) {
      return resolve(null);
    }

    let levelSettings = await levelsRepository.getlevelSettings(guild);

    if (levelSettings == null) {
      return resolve(null);
    }

    if (levelSettings.levelRolesActive === 0) {
      return resolve(null);
    }

    if (member.user.bot == true) {
      return resolve(null);
    }

    if (!member) {
      return resolve(null);
    }

    if (guild.id == null) {
      return resolve(null);
    }

    const getUser = await usersRepository.getUser(member.user.id, guild.id);

    if (!getUser) {
      return resolve(null);
    }

    let currentUserXp = await getUser.xP;
    let currentLevel = await getUser.Level;
    let newRoleId = "";
    let oldRoleId = "";

    if (currentUserXp < 100) {
      return resolve(null);
    }

    // RANK UP
    if (currentLevel === levelSettings.LevelUp1) {
      newRoleId = levelSettings.level1;
      if (oldLevel < currentLevel) {
      } else {
        oldRoleId = levelSettings.level2;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp2 &&
      currentLevel < levelSettings.LevelUp3
    ) {
      newRoleId = levelSettings.level2;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level1;
      } else {
        oldRoleId = levelSettings.level3;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp3 &&
      currentLevel < levelSettings.LevelUp4
    ) {
      newRoleId = levelSettings.level3;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level2;
      } else {
        oldRoleId = levelSettings.level4;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp4 &&
      currentLevel < levelSettings.LevelUp5
    ) {
      newRoleId = levelSettings.level4;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level3;
      } else {
        oldRoleId = levelSettings.level5;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp5 &&
      currentLevel < levelSettings.LevelUp6
    ) {
      newRoleId = levelSettings.level5;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level4;
      } else {
        oldRoleId = levelSettings.level6;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp6 &&
      currentLevel < levelSettings.LevelUp7
    ) {
      newRoleId = levelSettings.level6;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level5;
      } else {
        oldRoleId = levelSettings.level7;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp7 &&
      currentLevel < levelSettings.LevelUp8
    ) {
      newRoleId = levelSettings.level7;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level6;
      } else {
        oldRoleId = levelSettings.level8;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp8 &&
      currentLevel < levelSettings.LevelUp9
    ) {
      newRoleId = levelSettings.level8;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level7;
      } else {
        oldRoleId = levelSettings.level9;
      }
    } else if (
      currentLevel >= levelSettings.LevelUp9 &&
      currentLevel < levelSettings.LevelUp10
    ) {
      newRoleId = levelSettings.level9;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level8;
      } else {
        oldRoleId = levelSettings.level10;
      }
    } else if (currentLevel >= levelSettings.LevelUp10) {
      newRoleId = levelSettings.level10;
      if (oldLevel < currentLevel) {
        oldRoleId = levelSettings.level9;
      } else {
      }
    } else {
      return resolve(null);
    }

    if (!newRoleId) {
      return resolve(null);
    } else {
      if (member.roles.cache.get(newRoleId)) {
      } else {
        let newRole = guild.roles.cache.get(newRoleId);
        await member.roles.add(newRole).catch(console.error);

        const rankChannel = levelSettings.rankChannel;

        if (rankChannel === undefined) {
        } else {
          let statusText = "";

          if (oldLevel > currentLevel) {
            statusText = "degradiert";
          } else {
            statusText = "befördert";
          }

          const embedBefoerderung = new EmbedBuilder()
            .setTitle(`⚡️ Level-System ⚡️`)
            .setDescription(
              `${member} wurde zum ${newRole.name} ${statusText}!`
            )
            .setColor(0xf1c232)
            .setTimestamp(Date.now())
            .setFooter({
              iconURL: guild.client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            });

          await guild.client.channels.cache
            .get(rankChannel)
            .send({ embeds: [embedBefoerderung] })
            .catch(console.error);

          const pingMember = await guild.client.channels.cache
            .get(rankChannel)
            .send(`${member}`)
            .catch(console.error);

          setTimeout(function() {
            pingMember.delete();
          }, 200);

          const loggingHandler = require("../../functions/fileLogging/loggingHandler");
          const logText = `GUILD: ${member.guild.id} | #RANK UP --> USER: ${member.displayName} (ID: ${member.id}) wurde zum ${newRole.name} ${statusText}`;
          loggingHandler.log(logText, "xP_logging");
        }
      }
    }

    if (!oldRoleId) {
      return resolve(null);
    }

    if (oldRoleId === newRoleId) {
      return resolve(null);
    }

    if (member.roles.cache.get(oldRoleId)) {
      let oldRole = guild.roles.cache.get(oldRoleId);
      await member.roles.remove(oldRole).catch(console.error);
    } else {
      return resolve(null);
    }

    return resolve(null);
  });
}

module.exports.autoUserRoles = autoUserRoles;
