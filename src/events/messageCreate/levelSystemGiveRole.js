const { EmbedBuilder } = require("discord.js");
const usersRepository = require("../../mysql/usersRepository");
const levelsRepository = require("../../mysql/levelsRepository");

module.exports = async function messageCreate(message) {
  return new Promise(async (resolve) => {
    const { client, guild, member, author } = message;

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

    if (author.bot == true) {
      return resolve(null);
    }

    if (!member) {
      return resolve(null);
    }

    if (guild.id == null) {
      return resolve(null);
    }

    const getUser = await usersRepository.getUser(author.id, guild.id);

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

    if (currentLevel === levelSettings.LevelUp1) {
      newRoleId = levelSettings.level1;
    } else if (
      currentLevel >= levelSettings.LevelUp2 &&
      currentLevel < levelSettings.LevelUp3
    ) {
      oldRoleId = levelSettings.level1;
      newRoleId = levelSettings.level2;
    } else if (
      currentLevel >= levelSettings.LevelUp3 &&
      currentLevel < levelSettings.LevelUp4
    ) {
      oldRoleId = levelSettings.level2;
      newRoleId = levelSettings.level3;
    } else if (
      currentLevel >= levelSettings.LevelUp4 &&
      currentLevel < levelSettings.LevelUp5
    ) {
      oldRoleId = levelSettings.level3;
      newRoleId = levelSettings.level4;
    } else if (
      currentLevel >= levelSettings.LevelUp5 &&
      currentLevel < levelSettings.LevelUp6
    ) {
      oldRoleId = levelSettings.level4;
      newRoleId = levelSettings.level5;
    } else if (
      currentLevel >= levelSettings.LevelUp6 &&
      currentLevel < levelSettings.LevelUp7
    ) {
      oldRoleId = levelSettings.level5;
      newRoleId = levelSettings.level6;
    } else if (
      currentLevel >= levelSettings.LevelUp7 &&
      currentLevel < levelSettings.LevelUp8
    ) {
      oldRoleId = levelSettings.level6;
      newRoleId = levelSettings.level7;
    } else if (
      currentLevel >= levelSettings.LevelUp8 &&
      currentLevel < levelSettings.LevelUp9
    ) {
      oldRoleId = levelSettings.level7;
      newRoleId = levelSettings.level8;
    } else if (
      currentLevel >= levelSettings.LevelUp9 &&
      currentLevel < levelSettings.LevelUp10
    ) {
      oldRoleId = levelSettings.level8;
      newRoleId = levelSettings.level9;
    } else if (currentLevel >= levelSettings.LevelUp10) {
      oldRoleId = levelSettings.level9;
      newRoleId = levelSettings.level10;
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
          const embedBefoerderung = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Level-System ⚡️`)
            .setDescription(`${member} wurde zum ${newRole.name} befördert!`)
            .setColor(0xf1c232)
            .setTimestamp(Date.now())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`,
            });

          await client.channels.cache
            .get(rankChannel)
            .send({ embeds: [embedBefoerderung] })
            .catch(console.error);

          await client.channels.cache
            .get(rankChannel)
            .send(`${member}`)
            .catch(console.error);
          setTimeout(function () {
            client.channels.cache.get(rankChannel).bulkDelete(1, true);
          }, 100);
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
};
