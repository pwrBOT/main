const { EmbedBuilder, ActivityType } = require("discord.js");
const config = require(`../../../config.json`);
const usersRepository = require("../../mysql/usersRepository");
const chalk = require("chalk");

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
      const embed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot ⚡️ | Status: 🟢`)
        .setDescription(`Ich bin da, wer noch?`)
        .setThumbnail(client.user.displayAvatarURL())
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`,
        })
        .addFields([
          {
            name: `Eingeloggt als:`,
            value: `${client.user.tag}`,
            inline: true,
          },
          {
            name: `Online bei:`,
            value: `${botGuilds}`,
            inline: false,
          },
        ]);

      client.user.setPresence({
        activities: [{ name: `Danny`, type: ActivityType.Listening }],
        status: "online",
      });
      client.user.setUsername("PowerBot [DEV]").catch(console.error);

      const channel = client.channels.cache.get(config.powerbot_status_channel);
      channel.send({ embeds: [embed] });

      console.log(
        `\x1b[32mOnline! ${client.user.tag} is now logged in and online!\x1b[0m`
      );

      //// ##################### TABLE CHECK ##################### \\\\

      await allBotGuilds.forEach(async (guilds) => {
        //// CHECK / CREATE USER TABLE
        let data = client.guilds.cache.get(guilds.id);
        const usersRepository = require("../../mysql/usersRepository");
        const getUserTable = await usersRepository.getUserTable(data.id);
        if (getUserTable.length === 0) {
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
            chalk.green(
              `[MYSQL DATABASE] User Tabelle für Guild: ${data.name}(${data.id}) gefunden.`
            )
          );
        }

        //// CHECK / ADD GUILD-ID TO AUTO-MOD TABLE
        const autoModRepository = require("../../mysql/autoModRepository");
        const getAutoModGuildSettings =
        await autoModRepository.getGuildAutoModSettings(data);
        if (getAutoModGuildSettings.length === 0) {
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
            chalk.green(
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
            chalk.green(
              `[MYSQL DATABASE] Guild: ${data.name}(${data.id}) in Level Settings Tabelle gefunden.`
            )
          );
        }
      });
      //// ##################### TABLE CHECK END ##################### \\\\

      return resolve(null);
    });
  },
};
