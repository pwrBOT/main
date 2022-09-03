const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const guildsRepository = require("../../mysql/guildsRepository");


module.exports = async function guildCreate(guild) {
  return new Promise(async (resolve) => {
    const getGuild = await guildsRepository.getGuild(guild);
    if (getGuild.length === 0) {
      console.log(
        chalk.yellow(
          `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) nicht gefunden. Guild wird angelegt...`
        )
      );
      const addGuild = await guildsRepository.addGuild(guild);
      console.log(
        chalk.blue(
          `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) Settings erfolgreich angelegt!`
        )
      );
    }

      const newGuildEmbed = new EmbedBuilder()
      .setTitle(`⚡️ Welcome to PowerBot ⚡️`)
      .setDescription(`Du hast nun volle Power bei: 
      ${guild.name} 💪\n
      Schön, dass du bei deinem Discord Server die ultimative Power haben möchtest 🙋‍♂️ Damit alles reibungslos funktioniert, solltest du ein paar Dinge beachten 😎\n`)
      .setFields([
        {
          name: `1️⃣ Schritt 1:`,
          value: `Verschiebe die Bot-Rolle nach ganz oben. Lasse sie aber unter deiner Inhaber-Rolle. Der Bot kann nur User moderieren, deren Rolle UNTER der Bot-Rolle ist.\n
          Aber keine Angst: Es gibt Schutzmechanismen die es verbieten, dass der Server-Inhaber, oder andere Administratoren moderiert werden können.\n`,
          inline: true
        },
        {
          name: `2️⃣ Schritt 2:`,
          value: `Am Besten gibst du dem Bot Admin-Rechte. So kann er automatisch alle Channel sehen und du kannst ihn überall nutzen.\n
          Möchtest du dem Bot keine Adminrechte geben, musst du die Bot-Rolle allen Kategorien / Channeln einzeln hinzufügen. Sonst kann er diese nicht sehen.\n`,
          inline: true
        },
        {
          name: `3️⃣ Schritt 3:`,
          value: `Richte den Bot mit "/bot setup" ein!\n`,
          inline: false
        },
        {
          name: `⚡️ Allgemeines:`,
          value: `Du hast Fragen, Wünsche, Anregungen oder Probeleme? Dann melde dich bei uns und schau beim Support-Server vorbei:
          https://discord.gg/QfDNMCxzsN \n`,
          inline: false
        },
        {
          name: `✅ Danke und Viel Spaß:`,
          value: `Nun wünschen wir die viel Spaß mit dem PowerBot und bedanken uns vorab, dass du uns in der Erstphase unterstützt und den Bot nutzt.
          Gerade in der Anfangszeit ist dies sehr wichtig, damit Fehler schnell gefunden und ausgebessert werden können.\n`,
          inline: false
        },
        {
          name: `👨‍🔧 Working on:`,
          value: 
          `Welcome Message, Temp-Voice-Channel System, Level-System, Reaction-Roles, Auto-Moderation, Dashboard...`,
          inline: false
        }
      ])
      .setThumbnail(guild.iconURL())
      .setTimestamp(Date.now())
      .setImage('https://pwr.lol/img/discord_embed.jpg')
      .setFooter({
        text: `powered by PowerBot`,
      });
      const guildOwner = guild.members.cache.get(guild.ownerId)
      guildOwner.send({ embeds: [newGuildEmbed] });
    return resolve(null);
  });
}