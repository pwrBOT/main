const { EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const config = require("../../../config.json");

module.exports = {
  name: "guildCreate",

  async execute(guild) {
    return new Promise(async (resolve) => {

      /// CHECK IF GUILD IS BLOCKED \\\
      const guildOwner = await guild.fetchOwner();
      const guildsWhitelist = config.whitelist_testGuilds;
      const guildsBlacklist = config.blacklist_Guilds;
      const newGuildId = guild.id;

      if (!guildsWhitelist.includes(newGuildId)) {
        console.log(
          chalk.red(
            `WHITELIST CHECK NEGATIV | GUILD: ${guild.name}(${guild.id})`
          )
        );

        try {
          await guildOwner.send(`Dein Discord Server ist nicht Teil des Beta Programms. Du kannst den Bot nicht nutzen. Sry :(`);
        } catch (error) {}
        await guild.leave().catch(console.error);
        return resolve(null);
      }

      if (guildsBlacklist.includes(newGuildId)) {
        console.log(
          chalk.red(
            `BLACKLIST CHECK POSITIV | GUILD: ${guild.name}(${guild.id})`
          )
        );
        try {
          await guildOwner.send(`Dein Discord Server ist auf der Blacklist gelandet. Du kannst den Bot nicht mehr nutzen!`);
        } catch (error) {}
        await guild.leave().catch(console.error);
        return resolve(null);
      }

      //// ##################### TABLE CHECK ##################### \\\\
      //// CHECK / CREATE USER TABLE
      const usersRepository = require("../../mysql/usersRepository");
      const getUserTable = await usersRepository.getUserTable(guild.id);
      if (getUserTable.length === 0) {
        console.log(
          chalk.yellow(
            `[MYSQL DATABASE] User Tabelle von Guild: ${guild.name}(${guild.id}) nicht gefunden. Guild User Tabelle wird angelegt...`
          )
        );
        await usersRepository.createUserTable(guild.id);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) User Tabelle erfolgreich angelegt!`
          )
        );
      }

      //// CHECK / ADD GUILD-ID TO AUTO-MOD TABLE
      const autoModRepository = require("../../mysql/autoModRepository");
      const getAutoModGuildSettings =
        await autoModRepository.getGuildAutoModSettings(guild);
      if (getAutoModGuildSettings.length === 0) {
        console.log(
          chalk.yellow(
            `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) in AutoMod Tabelle nicht gefunden. Guild wird hinzugefügt...`
          )
        );
        await autoModRepository.addAutoModSettingsGuild(guild.id);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) bei AutoMod Tabelle erfolgreich angelegt!`
          )
        );
      }

      //// CHECK / ADD GUILD-ID TO LEVEL SYSTEM TABLE
      const levelsRepository = require("../../mysql/levelsRepository");
      const getlevelSettings = await levelsRepository.getlevelSettings(guild);
      if (!getlevelSettings) {
        console.log(
          chalk.yellow(
            `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) in Level Settings Tabelle nicht gefunden. Guild wird hinzugefügt...`
          )
        );
        await levelsRepository.addlevelSettings(guild.id);
        console.log(
          chalk.blue(
            `[MYSQL DATABASE] Guild: ${guild.name}(${guild.id}) bei Level Settings Tabelle erfolgreich angelegt!`
          )
        );
      }
      //// ##################### TABLE CHECK END ##################### \\\\

      //// ##################### IMPORT GUILD USER TO DB ##################### \\\\
      await guild.members.fetch().then(async (members) => {
        const sorting = (a, b) => {
          return a.joinedTimestamp - b.joinedTimestamp;
        };
        const sortedMembers = await members.sort(sorting);

        sortedMembers.forEach(async (member) => {
          const getUser = await usersRepository.getUser(
            member.user.id,
            member.guild.id
          );
          if (getUser) {
            return;
          } else {
            await usersRepository.addUser(
              member.guild.id,
              member.user,
              member.joinedTimestamp
            );
          }
        }),
          console.log(
            chalk.blue(
              `[MYSQL DATABASE] Alle vorhandenen User von Guild: ${guild.name}(${guild.id}) in User Tabelle importiert.`
            )
          );
      });

      //// ##################### IMPORT GUILD USER TO DB END ##################### \\\\

      const newGuildEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Welcome to PowerBot ⚡️`)
        .setDescription(
          `Du hast nun volle Power bei: 
      ${guild.name} 💪\n
      Schön, dass du bei deinem Discord Server die ultimative Power haben möchtest 🙋‍♂️ Damit alles reibungslos funktioniert, solltest du ein paar Dinge beachten 😎\n`
        )
        .setFields([
          {
            name: `1️⃣ Schritt 1:`,
            value: `Verschiebe die Bot-Rolle nach ganz oben. Lasse sie aber unter deiner Inhaber-Rolle. Der Bot kann nur User moderieren, deren Rolle UNTER der Bot-Rolle ist.\n
          Aber keine Angst: Es gibt Schutzmechanismen die es verbieten, dass der Server-Inhaber, oder andere Administratoren moderiert werden können.\n`,
            inline: true,
          },
          {
            name: `2️⃣ Schritt 2:`,
            value: `Am Besten gibst du dem Bot Admin-Rechte. So kann er automatisch alle Channel sehen und du kannst ihn überall nutzen.\n
          Möchtest du dem Bot keine Adminrechte geben, musst du die Bot-Rolle allen Kategorien / Channeln einzeln hinzufügen. Sonst kann er diese nicht sehen.\n`,
            inline: true,
          },
          {
            name: `3️⃣ Schritt 3:`,
            value: `Richte den Bot beim Dashboard (https://dashboard.pwr.lol/) ein!\n`,
            inline: false,
          },
          {
            name: `⚡️ Allgemeines:`,
            value: `Du hast Fragen, Wünsche, Anregungen oder Probeleme? Dann melde dich bei uns und schau beim Support-Server vorbei:
          https://discord.gg/QfDNMCxzsN \n`,
            inline: false,
          },
          {
            name: `✅ Danke und Viel Spaß:`,
            value: `Nun wünschen wir die viel Spaß mit dem PowerBot und bedanken uns vorab, dass du uns in der Erstphase unterstützt und den Bot nutzt.
          Gerade in der Anfangszeit ist dies sehr wichtig, damit Fehler schnell gefunden und ausgebessert werden können.\n`,
            inline: false,
          },
          {
            name: `👨‍🔧 Working on:`,
            value: `Welcome Message, Temp-Voice-Channel System, Level-System, Reaction-Roles, Auto-Moderation, Dashboard...`,
            inline: false,
          },
        ])
        .setThumbnail(guild.iconURL())
        .setTimestamp(Date.now())
        .setImage("https://pwr.lol/img/discord_embed.jpg")
        .setFooter({
          text: `powered by PowerBot`,
        });
      try {
        await guildOwner.send({ embeds: [newGuildEmbed] });
      } catch (error) {}

      const newGuildLogEmbed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | New Guild ⚡️`)
        .setDescription(
          `PowerBot wurde bei einem neuen Discordserver hinzugefügt`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .setThumbnail(guild.iconURL())
        .addFields([
          {
            name: `Guild Name:`,
            value: `${guild.name}`,
            inline: true,
          },
          {
            name: `Guild Owner:`,
            value: `${guildOwner.user.tag}\n${guildOwner.user.id}`,
            inline: true,
          },
          {
            name: `Guild erstellt:`,
            value: `${new Date(guild.createdTimestamp).toLocaleDateString(
              "de-DE"
            )} | ${new Date(guild.createdTimestamp).toLocaleTimeString(
              "de-DE"
            )}`,
            inline: true,
          },
          {
            name: `Anzahl der Mitglieder:`,
            value: `${guild.members.cache.size}`,
            inline: true,
          },
          {
            name: `\u200B`,
            value: `\u200B`,
            inline: true,
          },
        ]);

      const powerbotGuildLogChannelId = config.powerbot_guildlog_channel;
      client.channels.cache
        .get(powerbotGuildLogChannelId)
        .send({ embeds: [newGuildLogEmbed] });

      return resolve(null);
    });
  },
};
