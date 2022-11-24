const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: {
    name: `report_uebernahme`
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
      await reportRepository.updateReport(
        interaction.guild.id,
        reportId,
        `In process by ${interaction.user.tag}`,
        interaction.user.id
      );

      const buttonInBearbeitung = new ButtonBuilder()
        .setCustomId("report_uebernahme")
        .setLabel(`Report in Bearbeitung von ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const buttonErledigt = new ButtonBuilder()
        .setCustomId("report_erledigt")
        .setLabel(`Report als erledigt markieren`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);

      await interaction.message.edit({
        components: [
          new ActionRowBuilder().addComponents([
            buttonInBearbeitung,
            buttonErledigt
          ])
        ]
      });

      // CREATE PRIVATE THREAD \\
      const modThreadAreaId = await guildSettings.getGuildSetting(
        interaction.guild,
        "modArea"
      );

      if (!modThreadAreaId.value) {
        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen!\nEs wurde kein Mod-Thread erstellt (Keine Mod-Area definiert)`
        });
        return resolve(null);
      }

      const modThreadArea = await interaction.guild.channels.cache.get(
        modThreadAreaId.value
      );

      async function createPrivateThread() {
        const newThread = await modThreadArea.threads.create({
          name: `Report ${reportId} | Mod ${interaction.member.user.username}`,
          autoArchiveDuration: 60,
          type: ChannelType.PrivateThread,
          reason: "Thread for moderation"
        });

        const reportedUserId = await interaction.message.embeds[0].description
          .split("<@")[1]
          .split(">")[0];

        const reportEmbed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Reporting-System ⚡️`)
          .setDescription(
            `Hallo ${interaction.guild.members.cache.get(
              reportedUserId
            )}!\n\nDu wurdest von einem User gemeldet. Was kannst du uns dazu sagen?`
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

        await newThread.members.add(interaction.member.id);
        await newThread.members.add(reportedUserId);
        await newThread.send({ embeds: [reportEmbed] });
        const tagMember = await newThread.send(
          `${interaction.guild.members.cache.get(reportedUserId)} / ${
            interaction.member
          }`
        );
        setTimeout(function () {
          tagMember.delete();
        }, 100);

        await interaction.editReply({
          ephemeral: true,
          content: `✅ Du hast den Report übernommen!\n\nEin Mod-Thread mit dem Namen "Report ${reportId} | Mod ${interaction.member.user.username}" wurde erstellt.`
        });
        return resolve(null);
      }

      async function createOpenThread() {
        const newThread = await modThreadArea.threads.create({
          name: `Report ${reportId} | Mod ${interaction.member.user.username}`,
          autoArchiveDuration: 60,
          reason: "Thread for moderation"
        });

        const reportedUserId = await interaction.message.embeds[0].description
          .split("<@")[1]
          .split(">")[0];

        const reportEmbed = new EmbedBuilder()
          .setTitle(`⚡️ PowerBot | Reporting-System ⚡️`)
          .setDescription(
            `Hallo ${interaction.guild.members.cache.get(
              reportedUserId
            )}!\n\nDu wurdest von einem User gemeldet. Was kannst du uns dazu sagen?`
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

        await newThread.members.add(interaction.member.id);
        await newThread.members.add(reportedUserId);
        await newThread.send({ embeds: [reportEmbed] });
        const tagMember = await newThread.send(
          `${interaction.guild.members.cache.get(reportedUserId)} / ${
            interaction.member
          }`
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
        createPrivateThread();
      } else {
        createOpenThread();
      }
      // CREATE PRIVATE THREAD END \\

      const reportInArbeitEmbed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Reporting-System ⚡️`)
        .setDescription(
          `Hallo ${interaction.guild.members.cache.get(
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
            name: `Gemeldeter User:`,
            value: `${interaction.guild.members.cache.get(
              reportData.reportedMemberId
            )}`,
            inline: false
          },
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
        await interaction.guild.members.cache
          .get(reportData.reporterId)
          .send({ embeds: [reportInArbeitEmbed] });
      } catch (error) {}

      return resolve(null);
    });
  }
};
