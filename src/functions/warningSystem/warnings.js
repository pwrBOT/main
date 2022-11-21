const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const warnsRepository = require("../../mysql/warnsRepository");
const chalk = require("chalk");
const moment = require("moment");
const ms = require("ms");

const warnUser = async (guild, member, reason, modName, modId) => {
  return new Promise(async (resolve) => {
    await warnsRepository.addWarn(guild.id, member.id, reason, modName, modId);
    return resolve(null);
  });
};

const autoModWarn = async (guild, member) => {
  return new Promise(async (resolve) => {
    const client = guild.client;
    const servername = guild.name;
    const reason = "Zu viele Warns erhalten";

    // ################ PRE CHECK ############### \\
    const autoModRepository = require("../../mysql/autoModRepository");
    const autoWarnsModSettings =
      await autoModRepository.getGuildAutoModSettings(guild);

    if (autoWarnsModSettings.autoModWarnings === 0) {
      return resolve(null);
    }
    if (!member) {
      return resolve(null);
    }

    if (guild.ownerId === member.id) {
      return resolve(null);
    }

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return resolve(null);
    }

    if (member.manageable === false) {
      return resolve(null);
    }

    // ##########################  AUTO WARN MOD  ########################## \\
    const guildsRepository = require("../../mysql/guildsRepository");

    const teamRoleId = await guildsRepository.getGuildSetting(
      member.guild,
      "teamRole"
    );

    if (member.roles.cache.has(teamRoleId.value)) {
      return resolve(null);
    }

    const modLogChannel = await guildsRepository.getGuildSetting(
      guild,
      "modLog"
    );
    const embedSettings = await guildsRepository.getGuildSetting(
      guild,
      "embedinfo"
    );
    const embedInfo = embedSettings.value;
    if (!embedInfo) {
      embedInfo = "Bei Fragen wende dich an die Communityleitung!";
    }
    const tempCommandRepository = require("../../mysql/tempCommandRepository");
    const userWarns = await warnsRepository.getWarns(member);
 
    const warnsCount01 = autoWarnsModSettings.warnsCount01;
    let duration01 = autoWarnsModSettings.duration01;
    const sanctionType01 = autoWarnsModSettings.sanctionType01;

    const warnsCount02 = autoWarnsModSettings.warnsCount02;
    let duration02 = autoWarnsModSettings.duration02;
    const sanctionType02 = autoWarnsModSettings.sanctionType02;

    const warnsCount03 = autoWarnsModSettings.warnsCount03;
    let duration03 = autoWarnsModSettings.duration03;
    const sanctionType03 = autoWarnsModSettings.sanctionType03;

    if (warnsCount01 == 0 || duration01 == 0 || sanctionType01 == 0) {
    } else {
      if (userWarns.length == warnsCount01) {
        if (sanctionType01 === "timeout") {
          const autoWarnModEmbed1 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `User: ${member} wurde getimeouted!\nDauer: ${duration01}`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed1 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest getimeouted!\nServer: "${servername}"\nDauer: ${duration01}!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          if (duration01 === "**dauerhaft**") {
            duration01 = "99y";
          }
          member.timeout(ms(duration01), reason);

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed1] });

          try {
            await member.send({ embeds: [autoWarnModMemberEmbed1] });
          } catch (error) {}
        } else if (sanctionType01 === "ban") {
          const autoWarnModEmbed1 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(`User: ${member} wurde gebannt!`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed1 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest dauerhaft gebannt!\nServer: "${servername}"!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          member
            .ban({
              deleteMessageDays: 7,
              reason: "Zu viele Warns erhalten"
            })
            .catch(console.error);

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed1] });

          try {
            await member.send({ embeds: [autoWarnModMemberEmbed1] });
          } catch (error) {}
        } else if (sanctionType01 === "tempban") {
          var unbanDate = "";
          if (duration01 === "6h") {
            unbanDate = moment(new Date()).add(6, "hours");
          } else if (duration01 === "12h") {
            unbanDate = moment(new Date()).add(12, "hours");
          } else if (duration01 === "24h") {
            unbanDate = moment(new Date()).add(24, "hours");
          } else if (duration01 === "1w") {
            unbanDate = moment(new Date()).add(1, "week");
          } else if (duration01 === "2w") {
            unbanDate = moment(new Date()).add(2, "weeks");
          } else if (duration01 === "4w") {
            unbanDate = moment(new Date()).add(4, "weeks");
          } else if (duration01 === "1m") {
            unbanDate = moment(new Date()).add(2, "month");
          } else if (duration01 === "2m") {
            unbanDate = moment(new Date()).add(4, "months");
          } else if (duration01 === "4m") {
            unbanDate = moment(new Date()).add(6, "months");
          } else if (duration01 === "**dauerhaft**") {
            unbanDate = moment(new Date()).add(99, "years");
          }

          const autoWarnModEmbed1 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(`User: ${member} wurde temporär gebannt!`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Ban-Information:`,
                value: `Dauer: ${duration01}\nFreigabe: ${new Date(
                  unbanDate
                ).toLocaleDateString("de-DE")} | ${new Date(
                  unbanDate
                ).toLocaleTimeString("de-DE")}`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed1 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest temporär gebannt!\nServer: "${servername}"!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Ban-Information:`,
                value: `Dauer: ${duration01}\nFreigabe: ${new Date(
                  unbanDate
                ).toLocaleDateString("de-DE")} | ${new Date(
                  unbanDate
                ).toLocaleTimeString("de-DE")}`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          const tempEnd = unbanDate.format();

          await tempCommandRepository.addTempCommandUser(
            guild.id,
            member.id,
            member.user.tag,
            "AutoMod - Zu viele Warns",
            "PowerBot | Auto Mod",
            " ",
            "tempban",
            tempEnd
          );
          member
            .ban({
              deleteMessageDays: 7,
              reason: "Zu viele Warns erhalten"
            })
            .catch(console.error);
          try {
            await member.send({ embeds: [autoWarnModMemberEmbed1] });
          } catch (error) {}

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed1] });
        }
      }
    }

    if (warnsCount02 == 0 || duration02 == 0 || sanctionType02 == 0) {
    } else {
      if (userWarns.length == warnsCount02) {
        if (sanctionType02 === "timeout") {
          const autoWarnModEmbed2 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `User: ${member} wurde getimeouted!\nDauer: ${duration02}`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed2 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest getimeouted!\nServer: "${servername}"\nDauer: ${duration02}!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          if (duration01 === "**dauerhaft**") {
            duration01 = "99y";
          }
          member.timeout(ms(duration02), reason);

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed2] });

          try {
            await member.send({ embeds: [autoWarnModMemberEmbed2] });
          } catch (error) {}
        } else if (sanctionType02 === "ban") {
          const autoWarnModEmbed2 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(`User: ${member} wurde gebannt!`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed2 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest dauerhaft gebannt!\nServer: "${servername}"!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          member
            .ban({
              deleteMessageDays: 7,
              reason: "Zu viele Warns erhalten"
            })
            .catch(console.error);

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed2] });

          try {
            await member.send({ embeds: [autoWarnModMemberEmbed2] });
          } catch (error) {}
        } else if (sanctionType02 === "tempban") {
          var unbanDate = "";
          if (duration02 === "6h") {
            unbanDate = moment(new Date()).add(6, "hours");
          } else if (duration02 === "12h") {
            unbanDate = moment(new Date()).add(12, "hours");
          } else if (duration02 === "24h") {
            unbanDate = moment(new Date()).add(24, "hours");
          } else if (duration02 === "1w") {
            unbanDate = moment(new Date()).add(1, "week");
          } else if (duration02 === "2w") {
            unbanDate = moment(new Date()).add(2, "weeks");
          } else if (duration02 === "4w") {
            unbanDate = moment(new Date()).add(4, "weeks");
          } else if (duration02 === "1m") {
            unbanDate = moment(new Date()).add(2, "month");
          } else if (duration02 === "2m") {
            unbanDate = moment(new Date()).add(4, "months");
          } else if (duration02 === "4m") {
            unbanDate = moment(new Date()).add(6, "months");
          } else if (duration02 === "**dauerhaft**") {
            unbanDate = moment(new Date()).add(99, "years");
          }

          const autoWarnModEmbed2 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(`User: ${member} wurde temporär gebannt!`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Ban-Information:`,
                value: `Dauer: ${duration02}\nFreigabe: ${new Date(
                  unbanDate
                ).toLocaleDateString("de-DE")} | ${new Date(
                  unbanDate
                ).toLocaleTimeString("de-DE")}`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed2 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest temporär gebannt!\nServer: "${servername}"!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Ban-Information:`,
                value: `Dauer: ${duration02}\nFreigabe: ${new Date(
                  unbanDate
                ).toLocaleDateString("de-DE")} | ${new Date(
                  unbanDate
                ).toLocaleTimeString("de-DE")}`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          const tempEnd = unbanDate.format();

          await tempCommandRepository.addTempCommandUser(
            guild.id,
            member.id,
            member.user.tag,
            "AutoMod - Zu viele Warns",
            "PowerBot | Auto Mod",
            " ",
            "tempban",
            tempEnd
          );
          member
            .ban({
              deleteMessageDays: 7,
              reason: "Zu viele Warns erhalten"
            })
            .catch(console.error);
          try {
            await member.send({ embeds: [autoWarnModMemberEmbed2] });
          } catch (error) {}

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed2] });
        }
      }
    }

    if (warnsCount03 == 0 || duration03 == 0 || sanctionType03 == 0) {
    } else {
      if (userWarns.length == warnsCount03) {
        if (sanctionType03 === "timeout") {
          const autoWarnModEmbed3 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `User: ${member} wurde getimeouted!\nDauer: ${duration03}`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed3 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest getimeouted!\nServer: "${servername}"\nDauer: ${duration03}!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          if (duration01 === "**dauerhaft**") {
            duration01 = "99y";
          }
          member.timeout(ms(duration03), reason);

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed3] });

          try {
            await member.send({ embeds: [autoWarnModMemberEmbed3] });
          } catch (error) {}
        } else if (sanctionType03 === "ban") {
          const autoWarnModEmbed3 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(`User: ${member} wurde gebannt!`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed3 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest dauerhaft gebannt!\nServer: "${servername}"!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          member
            .ban({
              deleteMessageDays: 7,
              reason: "Zu viele Warns erhalten"
            })
            .catch(console.error);

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed3] });

          try {
            await member.send({ embeds: [autoWarnModMemberEmbed3] });
          } catch (error) {}
        } else if (sanctionType03 === "tempban") {
          var unbanDate = "";
          if (duration03 === "6h") {
            unbanDate = moment(new Date()).add(6, "hours");
          } else if (duration03 === "12h") {
            unbanDate = moment(new Date()).add(12, "hours");
          } else if (duration03 === "24h") {
            unbanDate = moment(new Date()).add(24, "hours");
          } else if (duration03 === "1w") {
            unbanDate = moment(new Date()).add(1, "week");
          } else if (duration03 === "2w") {
            unbanDate = moment(new Date()).add(2, "weeks");
          } else if (duration03 === "4w") {
            unbanDate = moment(new Date()).add(4, "weeks");
          } else if (duration03 === "1m") {
            unbanDate = moment(new Date()).add(2, "month");
          } else if (duration03 === "2m") {
            unbanDate = moment(new Date()).add(4, "months");
          } else if (duration03 === "4m") {
            unbanDate = moment(new Date()).add(6, "months");
          } else if (duration03 === "**dauerhaft**") {
            unbanDate = moment(new Date()).add(99, "years");
          }

          const autoWarnModEmbed3 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(`User: ${member} wurde temporär gebannt!`)
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(member.displayAvatarURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Ban-Information:`,
                value: `Dauer: ${duration03}\nFreigabe: ${new Date(
                  unbanDate
                ).toLocaleDateString("de-DE")} | ${new Date(
                  unbanDate
                ).toLocaleTimeString("de-DE")}`,
                inline: false
              }
            ]);

          const autoWarnModMemberEmbed3 = new EmbedBuilder()
            .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
            .setDescription(
              `Du wurdest temporär gebannt!\nServer: "${servername}"!`
            )
            .setColor(0x51ff00)
            .setTimestamp(Date.now())
            .setThumbnail(guild.iconURL())
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `powered by Powerbot`
            })
            .addFields([
              {
                name: `Grund:`,
                value: `Zu viele Warns erhalten`,
                inline: false
              },
              {
                name: `Ban-Information:`,
                value: `Dauer: ${duration03}\nFreigabe: ${new Date(
                  unbanDate
                ).toLocaleDateString("de-DE")} | ${new Date(
                  unbanDate
                ).toLocaleTimeString("de-DE")}`,
                inline: false
              },
              {
                name: `Information:`,
                value: `${embedInfo}`,
                inline: false
              }
            ]);

          const tempEnd = unbanDate.format();

          await tempCommandRepository.addTempCommandUser(
            guild.id,
            member.id,
            member.user.tag,
            "AutoMod - Zu viele Warns",
            "PowerBot | Auto Mod",
            " ",
            "tempban",
            tempEnd
          );
          member
            .ban({
              deleteMessageDays: 7,
              reason: "Zu viele Warns erhalten"
            })
            .catch(console.error);
          try {
            await member.send({ embeds: [autoWarnModMemberEmbed3] });
          } catch (error) {}

          client.channels.cache
            .get(modLogChannel.value)
            .send({ embeds: [autoWarnModEmbed3] });
        }
      }
    }

    return resolve(null);
    // ##########################  AUTO WARN MOD END  ########################## \\
  });
};

module.exports.warnUser = warnUser;
module.exports.autoModWarn = autoModWarn;
