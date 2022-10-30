const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const warnsRepository = require("../../mysql/warnsRepository");
const guildSettings = require("../../mysql/guildsRepository");
const usersRepository = require("../../mysql/usersRepository");
const autoModSanctions = require("../../events/eventFunctions/autoModSanctions");
const ms = require("ms");
const antiSpamMap = new Map();

module.exports = async function messageCreate(message) {
  return new Promise(async (resolve) => {
    const guildId = message.guildId;

    if (message.guildId == null) {
      return resolve(null);
    }

    const getUser = await usersRepository.getUser(message.author.id, guildId);

    if (!getUser) {
      return resolve(null);
    }
    if (message.author.bot == true) {
      return resolve(null);
    }

    // ANTISPAM SYSTEM
    const LIMIT = 4;
    const TIME = 10000;
    const DIFF = 5000;
    const length = "5m";

    if (antiSpamMap.has(message.author.id)) {
      const userData = antiSpamMap.get(message.author.id);
      const { lastMessage, timer } = userData;
      const difference =
        message.createdTimestamp - lastMessage.createdTimestamp;
      let msgCount = userData.msgCount;
      console.log(difference);

      if (difference > DIFF) {
        clearTimeout(timer);
        userData.msgCount = 1;
        userData.lastMessage = message;
        userData.timer = setTimeout(() => {
          antiSpamMap.delete(message.author.id);
        }, TIME);
        antiSpamMap.set(message.author.id, userData);
      } else {
        ++msgCount;
        if (parseInt(msgCount) === LIMIT) {
          try {
            message.member.timeout(ms(length), "Spam");
          } catch (error) {}
          autoModWarnMember();
          console.log(`Spam Limit von ${message.author.tag} ausgelöst`);
          return resolve(null);
        } else {
          userData.msgCount = msgCount;
          antiSpamMap.set(message.author.id, userData);
          giveXP();
        }
      }
    } else {
      giveXP();
      let fn = setTimeout(() => {
        antiSpamMap.delete(message.author.id);
      }, TIME);
      antiSpamMap.set(message.author.id, {
        msgCount: 1,
        lastMessage: message,
        timer: TIME,
      });
    }

    async function giveXP() {
      let currentXP = getUser.xP;
      if (!currentXP) {
        currentXP = 0;
      }
      let XP = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
      var newXP = currentXP + XP;
      await usersRepository.addUserXP(guildId, message.author, newXP);

      const requiredXP = getUser.Level * getUser.Level * 100 + 100;

      if (newXP >= requiredXP) {
        let newLevel = (getUser.Level += 1);
        await usersRepository.addUserLevel(guildId, message.author, newLevel);
      }
      return resolve(null);
    }

    async function autoModWarnMember() {
      const teamRoleId = await guildSettings.getGuildSetting(
        message.guild,
        "teamRole"
      );

      if (message.member.roles.cache.has(teamRoleId.value)) {
        console.log(
          `SPAM CHECK | ${message.author.tag} Verwarnung gestoppt --> Team Mitglied`
        );
        return resolve(null);
      }

      if (message.member.id === message.client.user.id) {
        return resolve(null);
      }

      if (message.guild.ownerId === message.member.id) {
        console.log(
          `SPAM CHECK | ${message.author.tag} Verwarnung gestoppt --> Server Owner`
        );
        return resolve(null);
      }

      if (message.member.manageable === false) {
        console.log(
          `SPAM CHECK | ${message.author.tag} Verwarnung gestoppt --> Bot steht unter User`
        );
        return resolve(null);
      }

      const warnembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
        .setDescription(`User: ${message.member} wurde verwarnt`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(message.member.displayAvatarURL())
        .setFooter({
          iconURL: message.client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Grund:`,
            value: `Spam`,
            inline: true,
          },
          {
            name: `Moderator:`,
            value: `Auto-Mod`,
            inline: true,
          },
        ]);

      const warnembedmember = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
        .setDescription(
          `Du wurdest soeben verwarnt!\nServer: ${message.guild.name}`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(message.guild.iconURL())
        .setFooter({
          iconURL: message.client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Grund:`,
            value: `Spam`,
            inline: true,
          },
          {
            name: `Moderator:`,
            value: `Auto-Mod`,
            inline: true,
          },
          {
            name: `Information:`,
            value: `Bei Fragen wende dich bitte an die Projektleitung`,
            inline: false,
          },
        ]);

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(message.guild, "modLog", warnembed);

      await message.channel.send({ embeds: [warnembed] });

      try {
        await message.member.send({ embeds: [warnembedmember] });
      } catch (error) {}

      await warnsRepository.addWarn(
        message.guild.id,
        message.member.id,
        "Spam",
        message.client.user.tag,
        message.client.user.id
      );
      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        message.guild,
        "Auto-Mod Warn | Spam Check",
        message.client.user,
        message.member.user,
        "-"
      );

      await autoModSanctions.autoModSanctions(message.guild, message.member);

      console.log(
        chalk.yellow(
          `[${new Date().toLocaleDateString(
            "de-DE"
          )} / ${new Date().toLocaleTimeString(
            "de-DE"
          )}] AUTO MOD INVITE | User ${
            message.member.user.tag
          } wurde verwarnt. Server: ${message.guild.name}.`
        )
      );
    }
    return resolve(null);
  });
};
