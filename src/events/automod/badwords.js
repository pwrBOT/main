const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const warnsRepository = require("../../mysql/warnsRepository");
const guildSettings = require("../../mysql/guildsRepository");
const warnSystem = require("../../functions/warningSystem/warnings");
const ms = require("ms");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    return new Promise(async resolve => {
      if (!message.member) {
        if (!message) {
          console.log(
            chalk.yellow(
              `[${new Date().toLocaleDateString(
                "de-DE"
              )} / ${new Date().toLocaleTimeString(
                "de-DE"
              )}] BADWORD | ERR --> NO MESSAGE.MEMBER DEFINED`
            )
          );
        }
        return resolve(null);
      }

      if (!message.guild) {
        if (!message) {
          console.log(
            chalk.yellow(
              `[${new Date().toLocaleDateString(
                "de-DE"
              )} / ${new Date().toLocaleTimeString(
                "de-DE"
              )}] BADWORD | ERR --> NO MESSAGE.GUILD DEFINED`
            )
          );
        }
        return resolve(null);
      }

      if (message.author.bot == true) {
        return resolve(null);
      }

      autoModBadwords = await guildSettings.getGuildSetting(
        message.guild,
        "autoModBadwords"
      );

      if (!autoModBadwords) {
        return resolve(null);
      }

      if (autoModBadwords.value.length === 0) {
        return resolve(null);
      }

      let badwords = await guildSettings.getGuildSetting(
        message.guild,
        "badwords"
      );

      if (!badwords && badwords.value.length === 0) {
        badwords = ["hure", "hurre", "Analbaron", "Fettsau", "Arschfotzengesicht", "Arschgesicht", "Spast", "Auspuffbumser", "Bumsnuss", "Dauerlutscher", "Muschi", "Fotze", "Gay", "Fresse", "Hodenbussard", "Hodenkopf", "Kotlutscher", "Mongo", "Opfer", "Peniskopf", "Pimmelfresse", "Pimmelkopf", "Pimmelpapagei", "Sackfotze", "Schlampe", "Schmongo", "Slut", "Spastard", "spastophil", "Vollmongo", "Wichsbazille", "Wichsfisch", "anal", "analritter", "arschficker", "arschgeburt", "arschgeige", "arschgesicht", "arschhaarfetischist", "arschhaarrasierer", "arschhöhlenforscher", "arschloch", "asshole", "motherfucker", "bastard", "bauernschlampe", "biatch", "bimbo", "bitch", "bitches", "cock", "eierlutscher", "ficken", "ficker", "fickfehler", "fickfetzen", "fickfresse", "kanacke", "kanake", "kanaken", "kinderficker", "kinderporno", "kotgeburt", "möse", "mösenficker", "mösenlecker", "motherfucker", "muschilecker", "muschischlitz", "mutterficker", "nazi", "nazis", "neger", "nigga", "nigger", "nutte", "nuttensohn", "nuttenstecher", "nuttentochter", "schwuchtel"]
      }

      for (const badword of JSON.parse(badwords.value.toLowerCase())) {
        if (message.content.toLowerCase().includes(badword)) {
            deleteMessage()
            userTimeout()
            autoModWarnMember()

          return resolve(null);
        }
      }
      async function deleteMessage() {
        try {
          await message.delete();
          await message.channel.send(
            `_Nachricht von ${message.member} gelöscht! (Auto Mod | Bad Word)_`
          );
        } catch (error) {}

        console.log(
          chalk.yellow(
            `[${new Date().toLocaleDateString(
              "de-DE"
            )} / ${new Date().toLocaleTimeString(
              "de-DE"
            )}] AUTO MOD BADWORD | Nachricht (${message.content}) von ${
              message.member.user.tag
            } gelöscht. Server: ${message.guild.name}.`
          )
        );
      }

      async function userTimeout() {
        const teamRoleId = await guildSettings.getGuildSetting(
          message.guild,
          "teamRole"
        );

        if (message.member.roles.cache.has(teamRoleId.value)) {
          return resolve(null);
        }

        if (message.guild.ownerId === message.member.id) {
          return resolve(null);
        }

        if (message.member.manageable === false) {
          return resolve(null);
        }

        const length = "1h";
        const guildsRepository = require("../../mysql/guildsRepository");
        const embedInfo = await guildsRepository.getGuildSetting(
          message.guild,
          "embedinfo"
        );
        if (!embedInfo) {
          embedInfo = "Bei Fragen wende dich an die Communityleitung!";
        }

        const modlogembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
          .setDescription(
            `User: ${message.member} wurde getimeouted!\nDauer: ${length}`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.member.displayAvatarURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Auto-Mod | Bad Word`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: "Auto-Mod",
              inline: true
            }
          ]);

        const embedmember = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
          .setDescription(
            `Du wurdest getimeouted!\nServer: "${message.guild.name}"\nDauer: ${length}!`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.guild.iconURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Auto-Mod | Bad Word`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: "Auto-Mod",
              inline: true
            },
            {
              name: `Information:`,
              value: `${embedInfo.value}`,
              inline: false
            }
          ]);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(message.guild, "modLog", modlogembed);

        try {
          message.member.timeout(ms(length), "Auto-Mod | Bad Word");
        } catch (error) {}

        try {
          await message.member.send({ embeds: [embedmember] });
        } catch (error) {}

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod | Timout Auto-Mod | Bad Word",
          message.client.user,
          message.member.user,
          "-"
        );

        return resolve(null);
      }

      async function autoModWarnMember() {
        const teamRoleId = await guildSettings.getGuildSetting(
            message.guild,
            "teamRole"
          );
  
          if (message.member.roles.cache.has(teamRoleId.value)) {
            return resolve(null);
          }
  
          if (message.guild.ownerId === message.member.id) {
            return resolve(null);
          }
          F
        let userMessage = "";

        if (message.content) {
          userMessage = message.content;
        } else {
          userMessage = "-";
        }

        const warnembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
          .setDescription(`User: ${message.member} wurde verwarnt`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setThumbnail(message.member.displayAvatarURL())
          .setFooter({
            iconURL: message.client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Auto-Mod | Bad Word`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: `Auto-Mod`,
              inline: true
            },
            {
              name: `Nachricht:`,
              value: `${userMessage}`,
              inline: false
            }
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
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Grund:`,
              value: `Auto-Mod | Bad Word`,
              inline: true
            },
            {
              name: `Moderator:`,
              value: `Auto-Mod`,
              inline: true
            },
            {
              name: `Information:`,
              value: `Bei Fragen wende dich bitte an die Projektleitung`,
              inline: false
            }
          ]);

        const logChannel = require("../../mysql/loggingChannelsRepository");
        await logChannel.logChannel(message.guild, "modLog", warnembed);

        await message.channel.send({ embeds: [warnembed] });

        try {
          await message.member.send({ embeds: [warnembedmember] });
        } catch (error) {}

        await warnSystem.warnUser(message.guild, message.member, "Auto-Mod | Bad Word", message.client.user.tag, message.client.user.id)
        await warnSystem.autoModWarn(message.guild, message.member)

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          message.guild,
          "Auto-Mod Warn | Bad Word",
          message.client.user,
          message.member.user,
          "-"
        );

        console.log(
          chalk.yellow(
            `[${new Date().toLocaleDateString(
              "de-DE"
            )} / ${new Date().toLocaleTimeString(
              "de-DE"
            )}] AUTO MOD BADWORDS | User ${
              message.member.user.tag
            } wurde verwarnt. Server: ${message.guild.name}.`
          )
        );
      }
    });
  }
};
