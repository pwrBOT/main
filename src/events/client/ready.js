const {
  EmbedBuilder,
  ActivityType,
} = require("discord.js");
const config = require(`../../../config.json`);

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    var botGuilds ="";
    const allBotGuilds = client.guilds.cache.map(guild => guild)
    allBotGuilds.forEach((guilds) => {
      const date = new Date(guilds.joinedTimestamp).toLocaleDateString("de-DE");
      botGuilds += `${guilds.name} (${guilds.id})\nAm Server seit: ${date}\n\n`
    })    
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

    client.user.setPresence({ activities: [{ name: `Danny`, type: ActivityType.Listening }], status: 'online'});
    client.user.setUsername("PowerBot [DEV]").catch(console.error);

    const channel = client.channels.cache.get(config.powerbot_status_channel);
    channel.send({ embeds: [embed] });

    console.log(`\x1b[32mOnline! ${client.user.tag} is now logged in and online!\x1b[0m`);
  },
};
