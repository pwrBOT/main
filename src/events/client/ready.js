const { EmbedBuilder, ActivityType } = require("discord.js");
const config = require(`../../../config.json`);
const chalk = require("chalk");
const dashboard = require("../../functions/dashboard/dashboard");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    return new Promise(async (resolve) => {
      var botGuilds = "";
      const allBotGuilds = client.guilds.cache.map((guild) => guild);

      allBotGuilds.forEach((guilds) => {
        const date = new Date(guilds.joinedTimestamp).toLocaleDateString(
          "de-DE"
        );
        botGuilds += `${guilds.name} (${guilds.id})\nAm Server seit: ${date}\n\n`;
      });

      //// ##################### TABLE CHECK ##################### \\\\

      await allBotGuilds.forEach(async (guilds) => {
        //// CHECK / CREATE USER TABLE
        let data = client.guilds.cache.get(guilds.id);
        const usersRepository = require("../../mysql/usersRepository");
        const getUserTable = await usersRepository.getUserTable(data.id);
        if (!getUserTable) {
        } else if (getUserTable.length === 0) {
          console.log(
            chalk.yellow(
              `[MYSQL DATABASE] User Tabelle von Guild: ${data.name}(${data.id}) nicht gefunden. Guild User Tabelle wird angelegt...`
            )
          );
          await usersRepository.createUserTable(data.id);
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) User Tabelle erfolgreich angelegt!`
            )
          );
        }
        {
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] User Tabelle für Guild: ${data.name}(${data.id}) gefunden.`
            )
          );
        }

        //// CHECK / ADD GUILD-ID TO AUTO-MOD TABLE
        const autoModRepository = require("../../mysql/autoModRepository");
        const getAutoModGuildSettings =
          await autoModRepository.getGuildAutoModSettings(data);
        if (!getAutoModGuildSettings) {
          console.log(
            chalk.yellow(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) in AutoMod Tabelle nicht gefunden. Guild wird hinzugefügt...`
            )
          );
          await autoModRepository.addAutoModSettingsGuild(data.id);
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) bei AutoMod Tabelle erfolgreich angelegt!`
            )
          );
        } else if (getAutoModGuildSettings.length === 0) {
          console.log(
            chalk.yellow(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) in AutoMod Tabelle nicht gefunden. Guild wird hinzugefügt...`
            )
          );
          await autoModRepository.addAutoModSettingsGuild(data.id);
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) bei AutoMod Tabelle erfolgreich angelegt!`
            )
          );
        } else {
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) in AutoMod Tabelle gefunden.`
            )
          );
        }

        //// CHECK / ADD GUILD-ID TO AUTO-MOD TABLE
        const levelsRepository = require("../../mysql/levelsRepository");
        const getlevelSettings = await levelsRepository.getlevelSettings(data);
        if (!getlevelSettings) {
          console.log(
            chalk.yellow(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) in Level Settings Tabelle nicht gefunden. Guild wird hinzugefügt...`
            )
          );
          await levelsRepository.addlevelSettings(data.id);
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) bei Level Settings Tabelle erfolgreich angelegt!`
            )
          );
        } else {
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) in Level Settings Tabelle gefunden.`
            )
          );
        }
      });
      //// ##################### TABLE CHECK END ##################### \\\\

      await dashboard.init(client);

      client.user.setPresence({
        activities: [{ name: `Danny`, type: ActivityType.Custom }],
        status: "online"
      });

      setTimeout(async function () {
        const onlineEmbed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot ⚡️ | Status: 🟢`)
          .setDescription(`Ich bin da, wer noch?`)
          .setThumbnail(client.user.displayAvatarURL())
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by PowerBot`
          })
          .addFields([
            {
              name: `Eingeloggt als:`,
              value: `${client.user.username}`,
              inline: false
            },
            {
              name: `Online bei:`,
              value: `${botGuilds}`,
              inline: false
            }
          ]);

        const channel = await client.channels.cache.get(
          config.powerbot_status_channel
        );
        channel.send({ embeds: [onlineEmbed] }).catch((error) => {});
      }, 5000);

      setTimeout(function () {
        console.log(
          `\x1b[32m
            #########################################################
            Online! ${client.user.username} is now logged in and online!
            #########################################################
            \x1b[0m`
        );
      }, 3000);

      return resolve(null);
    });
  }
};
