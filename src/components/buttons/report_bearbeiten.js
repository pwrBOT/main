const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: {
    name: `report_bearbeiten`
  },
  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: true,
        fetchReply: true
      });

      const guildSettings = require("../../mysql/guildsRepository");
      const modRoleId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modRole"
      );

      if (!modRoleId) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Keine Moderator-Rolle definiert! ❌"
        });
        return resolve(null);
      }

      let isModerator = false;

      const modRoleIds = JSON.parse(modRoleId.value);
      modRoleIds.forEach((modRoleId) => {
        if (interaction.member.roles.cache.has(modRoleId)) {
          isModerator = true;
        }
      });

      if (!isModerator) {
        interaction.editReply({
          ephemeral: true,
          content: "❌ Du bist kein Moderator! ❌"
        });
        return resolve(null);
      }

      const reportId = await interaction.message.embeds[0].description.split(
        "#"
      )[1];
      const reportRepository = require("../../mysql/reportRepository");
      const reportData = await reportRepository.getReport(
        interaction.guild.id,
        reportId
      );

      if (interaction.user.id != reportData.modId) {
        await interaction.editReply({
          ephemeral: true,
          content: `❌ Du kannst den Report nicht abschließen. Du bearbeitest ihn nicht!`
        });
        return resolve(null);
      }

      await reportRepository.updateReport(
        interaction.guild.id,
        reportId,
        `In process by ${interaction.user.username}`,
        interaction.user.id,
        "-"
      );

      const buttonUebernahme = new ButtonBuilder()
        .setCustomId("report_uebernahme")
        .setLabel(`Report in Bearbeitung von ${interaction.member.displayName}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const buttonBearbeiten = new ButtonBuilder()
        .setCustomId("report_bearbeiten")
        .setLabel(`Thread wurde erstellt`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report als erledigt markieren`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      const buttonLinkToThread = new ButtonBuilder()
        .setLabel(`Zum Thread`)
        .setStyle(ButtonStyle.Link)

      // CREATE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      const reportedUserId = await interaction.message.embeds[0].description
        .split("<@")[1]
        .split(">")[0];

      const reportedMember = await interaction.guild.members
        .fetch(reportedUserId)
        .catch((error) => { });

      if (!reportedMember) {
        await interaction.editReply({
          ephemeral: true,
          content: `❌ Der User scheint nicht mehr auf diesem Discord zu sein und konnte nicht gefunden werden.\nEs wurde kein Thread erstellt!`
        });
        return resolve(null);
      }

      if (modThreadAreaId) {
        if (!modThreadAreaId.value) {
          await interaction.editReply({
            ephemeral: true,
            content: `✅ Du hast den Report übernommen!\nEs wurde kein Thread erstellt (Keine Mod-Area definiert)`
          });
          return resolve(null);
        }
      } else {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen!\nEs wurde kein Thread erstellt (Keine Mod-Area definiert)`
        });
        return resolve(null);
      }

      const modThreadArea = await interaction.guild.channels.fetch(
        modThreadAreaId.value
      );

      async function createPrivateThread() {
        const newThread = await modThreadArea.threads.create({
          name: `Report ${reportId}`,
          autoArchiveDuration: 60,
          type: ChannelType.PrivateThread,
          invitable: false,
          reason: "Thread for moderation"
        });

        buttonLinkToThread.setURL(newThread.url)

        const reportedUserId = await interaction.message.embeds[0].description
          .split("<@")[1]
          .split(">")[0];

        const reportEmbed = new EmbedBuilder()
          .setTitle(`⚡️ Reporting-System ⚡️`)
          .setDescription(
            `Hallo ${reportedMember}!\n\nDu wurdest von einem User gemeldet. Was kannst du uns dazu sagen?`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Beschwerdemeldung:`,
              value: `${reportData.reportReason}`,
              inline: false
            },
            {
              name: `Bearbeitender Moderator:`,
              value: `${interaction.member}`,
              inline: false
            }
          ]);

        const reportUserEmbed = new EmbedBuilder()
          .setTitle(`⚡️ Reporting-System ⚡️`)
          .setDescription(
            `Hallo ${reportedMember}!\n\nDu wurdest von einem User gemeldet!\n\nEin Moderator bearbeitet den Fall nun und wartet auf deine Rückmeldung\n➡️ [>>> HIER ANTWORTEN <<<](${newThread.url})`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })

        await reportedMember.send({ embeds: [reportUserEmbed] }).catch(error => { })

        try {
          await newThread.members.add(interaction.member.id).catch(error => { })
        } catch (error) {
          interaction.channel.send({
            content: `✅Thread erstellt\n❌ Du konntest nicht zum Thread hinzugefügt werden, da du die Mod-Area nicht sehen kannst!`
          });
        }

        try {
          await newThread.members.add(reportedUserId);
        } catch (error) {
          interaction.channel.send({
            content: `✅Thread erstellt\n❌ ${reportedMember} konnte nicht zum Thread hinzugefügt werden, da er die Mod-Area nicht sehen kann!`
          });
        }

        await newThread.send({ embeds: [reportEmbed] });
        const tagMember = await newThread.send(
          `${reportedMember} / ${interaction.member}`
        );
        setTimeout(function () {
          tagMember.delete();
        }, 100);

        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du bearbeitest nun den Report!\nEin Thread wurde erstellt.`
        });
        return resolve(null);
      }

      async function createOpenThread() {
        const newThread = await modThreadArea.threads.create({
          name: `Report ${reportId}`,
          autoArchiveDuration: 60,
          invitable: false,
          reason: "Thread for moderation"
        });

        buttonLinkToThread.setURL(newThread.url)

        const reportedUserId = await interaction.message.embeds[0].description
          .split("<@")[1]
          .split(">")[0];

        const reportEmbed = new EmbedBuilder()
          .setTitle(`⚡️ Reporting-System ⚡️`)
          .setDescription(
            `Hallo ${reportedMember}!\n\nDu wurdest von einem User gemeldet. Was kannst du uns dazu sagen?`
          )
          .setColor(0x51ff00)
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          })
          .addFields([
            {
              name: `Beschwerdemeldung:`,
              value: `${reportData.reportReason}`,
              inline: false
            },
            {
              name: `Bearbeitender Moderator:`,
              value: `${interaction.member}`,
              inline: false
            }
          ]);

        try {
          await newThread.members.add(interaction.member.id);
        } catch (error) {
          interaction.channel.send({
            content: `✅Thread erstellt\n❌ Du konntest nicht zum Thread hinzugefügt werden, da du die Mod-Area nicht sehen kannst!`
          });
        }

        try {
          await newThread.members.add(reportedUserId);
        } catch (error) {
          interaction.channel.send({
            content: `✅Thread erstellt\n❌ ${reportedMember} konnte nicht zum Thread hinzugefügt werden, da er die Mod-Area nicht sehen kann!`
          });
        }

        await newThread.send({ embeds: [reportEmbed] });
        const tagMember = await newThread.send(
          `${reportedMember} / ${interaction.member}`
        );
        setTimeout(function () {
          tagMember.delete();
        }, 100);

        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen! Es wurde ein Thread erstellt, der möglicherweise für alle sichtbar ist!. Für Private-Threads ist Discord-Boost-Level 3 erforderlich!)`
        });
        return resolve(null);
      }

      if (interaction.guild.premiumTier === 3) {
        await interaction.editReply({
          ephemeral: true,
          content: `⏳ . . .`
        });
        await createPrivateThread();
      } else {
        await interaction.editReply({
          ephemeral: true,
          content: `⏳ . . .`
        });
        await createOpenThread();
      }
      // CREATE PRIVATE THREAD END \\

      const reportInArbeitEmbed = new EmbedBuilder()
        .setTitle(`⚡️ Reporting-System ⚡️`)
        .setDescription(
          `Hallo ${await interaction.guild.members.fetch(
            reportData.reporterId
          )}!\n\nDein Report wurde soeben übernommen und befindet sich in Bearbeitung!`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Beschwerdemeldung:`,
            value: `${reportData.reportReason}`,
            inline: false
          },
          {
            name: `Gemeldeter User:`,
            value: `${reportedMember}`,
            inline: true
          },
          {
            name: `Bearbeitender Moderator:`,
            value: `${interaction.member}`,
            inline: true
          }
        ]);

      try {
        const reporter = await interaction.guild.members.fetch(
          reportData.reporterId
        );
        reporter.send({ embeds: [reportInArbeitEmbed] });
      } catch (error) { }

      await interaction.message.edit({
        components: [
          new ActionRowBuilder().addComponents([
            buttonUebernahme,
            buttonBearbeiten,
            buttonLinkToThread,
            buttonErledigt
          ])
        ]
      });

      return resolve(null);
    });
  }
};
