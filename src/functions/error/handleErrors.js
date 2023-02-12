const { Client, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const config = require("../../../config.json");

/**
 *
 * @param {Client} client
 */

module.exports = async (client) => {
  process.on("unhandledRejection", (reason, promise) => {
    console.error(reason, promise)


    console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Error`));
    console.log(chalk.red(reason, promise));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Es ist ein Fehler aufgetreten1:`)
      .setColor(0xff0000)
      .addFields([
        {
          name: `ERROR:`,
          value: `${reason}\n\n${promise}`,
          inline: false,
        },
      ])
      .setTimestamp(Date.now())
    errorChannel = config.powerbot_error_channel;
    client.channels.cache.get(errorChannel).send({ embeds: [errorEmbed] });
  });

  process.on("uncaughtException", (err, origin) => {
    console.error(err, origin)

    console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Error`));
    console.log(chalk.red(err, origin));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Es ist ein Fehler aufgetreten2:`)
      .setColor(0xff0000)
      .addFields([
        {
          name: `ERROR:`,
          value: `${err}\n\n${origin.toString()}`,
          inline: false,
        },
      ])
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `powered by Powerbot`,
      });
    errorChannel = config.powerbot_error_channel;
    client.channels.cache.get(errorChannel).send({ embeds: [errorEmbed] });
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.error(err, origin)

    console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Error`));
    console.log(chalk.red(err, origin));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Es ist ein Fehler aufgetreten3:`)
      .setColor(0xff0000)
      .addFields([
        {
          name: `ERROR:`,
          value: `${err}\n\n${origin.toString()}`,
          inline: false,
        },
      ])
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `powered by Powerbot`,
      });
    errorChannel = config.powerbot_error_channel;
    client.channels.cache.get(errorChannel).send({ embeds: [errorEmbed] });
  });

  process.on("rejectionHandled", (err, origin) => {
    console.error(err, origin)
    
    console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Error`));
    console.log(chalk.red(err, origin));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Es ist ein Fehler aufgetreten4:`)
      .setColor(0xff0000)
      .addFields([
        {
          name: `ERROR:`,
          value: `${err}\n\n${origin.toString()}`,
          inline: false,
        },
      ])
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `powered by Powerbot`,
      });
    errorChannel = config.powerbot_error_channel;
    client.channels.cache.get(errorChannel).send({ embeds: [errorEmbed] });
  });
};
