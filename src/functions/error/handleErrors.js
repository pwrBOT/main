const { Client, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const config = require("../../../config.json");

/**
 *
 * @param {Client} client
 */

module.exports = async (client) => {
  process.on("unhandledRejection", (reason, promise) => {
     console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Rejection`));
    console.log(chalk.red(reason, promise));
    console.log(reason)

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Unhandled Rejection:`)
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
    console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Exception`));
    console.log(chalk.red(err, origin));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Unhandled Exception:`)
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

    console.log(chalk.red(`[ERROR LOGGING] :: Unhandled Exception Monitor`));
    console.log(chalk.red(err, origin));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Unhandled Exception Monitor:`)
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
    
    console.log(chalk.red(`[ERROR LOGGING] :: Handled Error`));
    console.log(chalk.red(err, origin));

    const errorEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Error Management ⚡️`)
      .setDescription(`Es ist ein Fehler aufgetreten:`)
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
