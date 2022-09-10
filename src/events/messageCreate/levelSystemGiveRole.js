const { EmbedBuilder } = require("discord.js");
const usersRepository = require("../../mysql/usersRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = async function messageCreate(message) {
  return new Promise(async (resolve) => {
    const { client, guild, member, author } = message;

    if (guild == null) {
      return resolve(null);
    }

    let guildData = await guildSettingsRepository.getGuildSettings(guild);

    if (guildData == null) {
      return resolve(null);
    }

    if (author.bot == true) {
      return resolve(null);
    }

    if (guildData.levelRolesActive === 0) {
      return resolve(null);
    }

    if (!member) {
      return resolve(null);
    }

    if (guild.id == null) {
      return resolve(null);
    }

    if (!guildData.guildData == 0) {
      return resolve(null);
    }

    const getUser = await usersRepository.getUser(author.id, guild.id);

    if (!getUser) {
      return resolve(null);
    }

    let currentUserXp = getUser.xP;
    let currentLevel = "";
    let newRoleId = "";
    let oldRoleId = "";

    if (currentUserXp < 100) {
      return resolve(null);
    }

    if (currentUserXp < 1000) {
      currentLevel = "level1";
      newRoleId = guildData.level1;
    } else if (currentUserXp < 2000) {
      currentLevel = "level2";
      oldRoleId = guildData.level1;
      newRoleId = guildData.level2;
    } else if (currentUserXp < 4000) {
      currentLevel = "level3";
      oldRoleId = guildData.level2;
      newRoleId = guildData.level3;
    } else if (currentUserXp < 6000) {
      currentLevel = "level4";
      oldRoleId = guildData.level3;
      newRoleId = guildData.level4;
    } else if (currentUserXp < 10000) {
      currentLevel = "level5";
      oldRoleId = guildData.level4;
      newRoleId = guildData.level5;
    } else if (currentUserXp < 15000) {
      currentLevel = "level6";
      oldRoleId = guildData.level5;
      newRoleId = guildData.level6;
    } else if (currentUserXp < 20000) {
      currentLevel = "level7";
      oldRoleId = guildData.level6;
      newRoleId = guildData.level7;
    } else if (currentUserXp < 30000) {
      currentLevel = "level8";
      oldRoleId = guildData.level7;
      newRoleId = guildData.level8;
    } else if (currentUserXp < 50000) {
      currentLevel = "level9";
      oldRoleId = guildData.level8;
      newRoleId = guildData.level9;
    } else {
      currentLevel = "level10";
      oldRoleId = guildData.level9;
      newRoleId = guildData.level10;
    }

    if (!newRoleId) {
      return resolve(null);
    } else {
      if (member.roles.cache.get(newRoleId)) {
      } else {
        let newRole = guild.roles.cache.get(newRoleId);
        await member.roles.add(newRole).catch(console.error);
        const rankChannel = guildData.rankChannel;
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
