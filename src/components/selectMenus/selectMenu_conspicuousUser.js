const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const conspicuousUserRepository = require("../../mysql/conspicuousUserRepository");

module.exports = {
  data: {
    name: `conspicuous_user`
  },

  async execute(interaction, client) {
    return new Promise(async resolve => {
      if (interaction.values[0] == "Abbrechen") {
        await interaction.reply({
          content: `Vorgang abgebrochen...`
        });

        await interaction.deleteReply().catch(error => {});

        await interaction.message.delete().catch(error => {});
        return resolve(null);
      }

      const valueData = await interaction.values[0].split(" | ");

      const reason = valueData[0];
      const userId = valueData[1];

      const member = await interaction.guild.members
        .fetch(userId)
        .catch(error => {});

      const conspicuousUserData = await conspicuousUserRepository.getSpecificEntry(
        interaction.guild.id,
        member.id,
        reason
      );

      if (conspicuousUserData) {
        await interaction.reply({
          content: `User ist bereits bzgl.: "${reason}" markiert!`
        });

        setTimeout(async function() {
          await interaction.deleteReply().catch(error => {});

          await interaction.message.delete().catch(error => {});
        }, 4000);

        return resolve(null);
      }

      await conspicuousUserRepository.addEntry(
        interaction.guild.id,
        member.id,
        reason,
        interaction.member.user.username,
        interaction.member.id
      );

      const conspicuousUserEmbed = new EmbedBuilder()
        .setTitle(`⚡️ ${interaction.guild.name} | Moderation ⚡️`)
        .setDescription(
          `${member} (${member.user
            .username}) zur Liste der auffälligen User hinzugefügt!`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}\n`,
            inline: false
          },
          {
            name: `Moderator:`,
            value: `${interaction.user.username}`,
            inline: true
          }
        ]);

      //   const conspicuousUserEmbedUser = new EmbedBuilder()
      //     .setTitle(`⚡️ Warning-System ⚡️`)
      //     .setDescription(`Ein Warn von dir wurde gelöscht!`)
      //     .setColor(0x51ff00)
      //     .setTimestamp(Date.now())
      //     .setFooter({
      //       iconURL: client.user.displayAvatarURL(),
      //       text: `powered by Powerbot`
      //     })
      //     .addFields([
      //       {
      //         name: `Gelöschte Verwarnung:`,
      //         value: `Grund: ${delWarnData.warnReason}\nGewarnt von: ${delWarnData.warnModName}\n`,
      //         inline: false
      //       },
      //       {
      //         name: `Gelöscht von Moderator:`,
      //         value: `${interaction.user.username}`,
      //         inline: true
      //       },
      //       {
      //         name: `Begründung:`,
      //         value: `${delreason}`,
      //         inline: true
      //       }
      //     ]);

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(
        interaction.guild,
        "modLog",
        conspicuousUserEmbed
      );

      await interaction.reply({
        embeds: [conspicuousUserEmbed],
        ephemeral: true
      });
      //   try {
      //     setTimeout(function () {
      //       interaction.deleteReply().catch((error) => {});
      //     }, 5000);
      //   } catch (error) {}

      // try {
      //   member.send({ embeds: [conspicuousUserEmbedUser] }).catch((error) => {});
      // } catch (error) {}

      await interaction.message.delete().catch(error => {});

      // ############## LOGGING ############## \\
      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "conspicuous user",
        interaction.user,
        member.user,
        "-"
      );
      // ############## LOGGING END ############## \\
      return resolve(null);
    });
  }
};
