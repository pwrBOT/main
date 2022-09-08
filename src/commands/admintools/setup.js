const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = {
  name: "bot setup | bot show",
  category: "admintools",
  description: "Einrichtung des Bots (Team-Rollen, Channel-Log, ...)",
  data: new SlashCommandBuilder()
    .setName(`bot`)
    .setDescription(`Bot Admin Tool`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`setup`)
        .setDescription(`Bot einrichten`)
        .addRoleOption((option) =>
          option
            .setName("botmaster")
            .setDescription("Bot Master Rolle festlegen")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("teamrole")
            .setDescription("Team Rolle festlegen")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("modrole")
            .setDescription("Moderator Rolle festlegen")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("botlog")
            .setDescription("Bot Logging Channel festlegen")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("modlog")
            .setDescription("Mod Logging Channel festlegen")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("welcomechannel")
            .setDescription("Welcome Channel festlegen")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("embedinfo")
            .setDescription("Embed Beschreibung festlegen")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("language")
            .setDescription("Bot-Sprache festlegen")
            .addChoices(
              { name: "Deutsch", value: "de" },
              { name: "English", value: "en" }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName(`show`).setDescription(`Guild Settings anzeigen`)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { options, guild } = interaction;
      const guildId = guild.id;
      const guildName = guild.name;
      const botMaster = options.getRole("botmaster");
      const teamRole = options.getRole("teamrole");
      const modRole = options.getRole("modrole");
      const botLog = options.getChannel("botlog");
      const modLog = options.getChannel("modlog");
      const welcomechannel = options.getChannel("welcomechannel");
      const embedInfo = options.getString("embedinfo");
      const language = options.getString("language");

      // #################### SETUP ###################### \\
      if (options.getSubcommand() === "setup") {
        const setupembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Setup ⚡️`)
          .setDescription(`Folgende Einstellungen wurden gespeichert:`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .addFields([
            {
              name: `Bot Master Rolle:`,
              value: `${botMaster}`,
              inline: true,
            },
            {
              name: `Team Rolle:`,
              value: `${teamRole}`,
              inline: true,
            },
            {
              name: `Moderator Rolle:`,
              value: `${modRole}`,
              inline: true,
            },
            {
              name: `Bot Log Channel:`,
              value: `${botLog}`,
              inline: true,
            },
            {
              name: `Moderations Log Channel:`,
              value: `${modLog}`,
              inline: true,
            },
            {
              name: `Welcome Channel:`,
              value: `${welcomechannel}`,
              inline: true,
            },
            {
              name: `Embed Information:`,
              value: `${embedInfo}`,
              inline: true,
            },
            {
              name: `Bot Sprache:`,
              value: `${language}`,
              inline: true,
            },
          ]);

        const guildSettings = await guildSettingsRepository.getGuildSettings(guild);

        if (!guildSettings) {
          await guildSettingsRepository.addGuild(
            guildId,
            guildName,
            botLog,
            modLog,
            botMaster,
            teamRole,
            modRole,
            welcomechannel,
            embedInfo,
            language,
          );

          const newMessage = `Bot Setup wurde gespeichert. Nähere Infos im Bot-Log ✅`;
          await interaction.reply({ content: newMessage });
          setTimeout(function () {
            interaction.deleteReply();
          }, 2000);

          const botLogChannel = client.channels.cache.get(botLog.id);
          botLogChannel.send({ embeds: [setupembed] });
          return resolve(null);
        }

        await guildSettingsRepository.updateGuild(
          guildId,
          guildName,
          botLog,
          modLog,
          botMaster,
          teamRole,
          modRole,
          welcomechannel,
          embedInfo,
          language
        );

        const newMessage = `Bot Setup wurde gespeichert. Nähere Infos im Bot-Log ✅`;
        await interaction.reply({ content: newMessage });
        setTimeout(function () {
          interaction.deleteReply();
        }, 2000);

        const botLogChannel = client.channels.cache.get(botLog.id);
        botLogChannel.send({ embeds: [setupembed] });
        return resolve(null);
      }

      // ################ SETUP SHOW ################## \\
      if (interaction.options.getSubcommand() === "show") {
        const noSettingsEmbed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Setup ⚡️`)
          .setDescription(
            `Keine Guild-Settings gefunden! Zuerst Bot-Setup abschließen!`
          )
          .setColor("Red")
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          });

        const guildSettings = await guildSettingsRepository.getGuildSettings(
          guild
        );
        if (!guildSettings) {
          interaction.reply({ embeds: [noSettingsEmbed] });
          return resolve(null);
        }

        if (guildSettings.length === 0) {
          interaction.reply({ embeds: [noSettingsEmbed] });
          return resolve(null);
        }

        const setupembed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Setup ⚡️`)
          .setDescription(`Folgende Einstellungen sind gespeichert:`)
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`,
          })
          .addFields([
            {
              name: `⚡️ Guild Infos:`,
              value: `Guild Name: ${guildSettings.guildName}\nGuild ID: ${guildSettings.guildId}`,
              inline: false,
            },
            {
              name: `👨‍🚀 Bot Master Rolle:`,
              value: `${guild.roles.cache.get(guildSettings.botMaster)}`,
              inline: false,
            },
            {
              name: `👥 Team Rolle:`,
              value: `${guild.roles.cache.get(guildSettings.teamRole)}`,
              inline: false,
            },
            {
              name: `👨‍✈️ Moderator Rolle:`,
              value: `${guild.roles.cache.get(guildSettings.modRole)}`,
              inline: false,
            },
            {
              name: `💬 Bot Log Channel:`,
              value: `${guild.channels.cache.get(guildSettings.botLog)}`,
              inline: false,
            },
            {
              name: `👁‍🗨 Moderations Log Channel:`,
              value: `${guild.channels.cache.get(guildSettings.modLog)}`,
              inline: false,
            },
            {
              name: `🙋‍♂️ Welcome Channel:`,
              value: `${guild.channels.cache.get(
                guildSettings.welcomechannel
              )}`,
              inline: false,
            },
            {
              name: `💬 Embed Information:`,
              value: `${guildSettings.embedInfo}`,
              inline: false,
            },
            {
              name: `🗣 Bot Sprache:`,
              value: `${guildSettings.language}`,
              inline: false,
            },
          ]);

        interaction.reply({ embeds: [setupembed] });
        return resolve(null);
      }
    });
  },
};
