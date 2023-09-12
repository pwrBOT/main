const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const warnsRepository = require("../../mysql/warnsRepository");

module.exports = {
  data: {
    name: `sm_warns_del`
  },

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      if (interaction.values[0] == "Abbrechen") {
        await interaction.reply({
          content: `Vorgang abgebrochen...`
        });

        await interaction.deleteReply().catch((error) => {});

        await interaction.message.delete();
        return resolve(null);
      }


      const valueData = await interaction.values[0].split(" | ");

      const warnId = valueData[0];
      const userId = valueData[1];
      const delreason = valueData[2];

      console.log(warnId, userId, delreason)

      const member = await interaction.guild.members
        .fetch(userId)
        .catch((error) => {});

      const delWarnData = await warnsRepository.getWarn(
        warnId,
        interaction.guild.id,
        userId
      );

      if (!delWarnData) {
        await interaction.reply({
          content: `Kein Warn mit ID: ${warnId} bei ${member} gefunden!`,
          ephemeral: true
        });
        return resolve(null);
      }

      const delWarnembed = new EmbedBuilder()
        .setTitle(`⚡️ Warning-System ⚡️`)
        .setDescription(`Warn von ${member} entfernt!`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Gelöschte Verwarnung:`,
            value: `Grund: ${delWarnData.warnReason}\nGewarnt von: ${delWarnData.warnModName}\n`,
            inline: false
          },
          {
            name: `Gelöscht von Moderator:`,
            value: `${interaction.user.username}`,
            inline: true
          },
          {
            name: `Begründung:`,
            value: `${delreason}`,
            inline: true
          }
        ]);

      const delWarnembedUser = new EmbedBuilder()
        .setTitle(`⚡️ Warning-System ⚡️`)
        .setDescription(`Ein Warn von dir wurde gelöscht!`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Gelöschte Verwarnung:`,
            value: `Grund: ${delWarnData.warnReason}\nGewarnt von: ${delWarnData.warnModName}\n`,
            inline: false
          },
          {
            name: `Gelöscht von Moderator:`,
            value: `${interaction.user.username}`,
            inline: true
          },
          {
            name: `Begründung:`,
            value: `${delreason}`,
            inline: true
          }
        ]);

      await warnsRepository.delWarn(warnId, member.user.id, delreason);

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", delWarnembed);

      await interaction.reply({ embeds: [delWarnembed] });
      try {
        setTimeout(function () {
          interaction.deleteReply().catch((error) => {});
        }, 5000);
      } catch (error) {}

      try {
        member.send({ embeds: [delWarnembedUser] }).catch((error) => {});
      } catch (error) {}

      await interaction.message.delete().catch(error =>{});

      // ############## LOGGING ############## \\
      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "warns delete",
        interaction.user,
        member.user,
        "-"
      );
      // ############## LOGGING END ############## \\
      return resolve(null);
    });
  }
};
