const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

module.exports = {
  name: "ban",
  category: "moderation",
  description: "User vom Discord bannen",
  data: new SlashCommandBuilder()
    .setName(`ban`)
    .setDescription(`User vom Server bannen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User der gebannt werden soll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("delete")
        .setDescription(
          "Sollen die Nachrichten der letzten 7 Tage gelöscht werden?"
        )
        .addChoices({ name: "Ja", value: "7" }, { name: "Nein", value: "0" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Begründung").setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true,
      });

      const { options, user, guild } = interaction;
      const member = options.getMember("user");
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const days = options.getString("delete");
      const servername = guild.name;

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      if (member.id === user.id) {
        interaction.editReply("❌ Du kannst dich nicht selber bannen! ❌");
        return resolve(null);
      }

      if (member.id === client.user.id) {
        interaction.editReply("❌ Du kannst den Bot nicht bannen! ❌");
        return resolve(null);
      }

      if (guild.ownerId === member.id) {
        interaction.editReply(
          "❌ Du kannst den Serverinhaber nicht bannen! ❌"
        );
        return resolve(null);
      }

      if (member.manageable === false) {
        interaction.editReply(
          "❌ Du hast hat zuwenig Power um den Befehl auszuführen ❌"
        );
        return resolve(null);
      }

      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        interaction.editReply("❌ Du kannst keinen Admin bannen! ❌");
        return resolve(null);
      }

      const banembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(
          `User: ${member} wurde vom Server gebannt\nID: ${member.id}`
        )
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(member.displayAvatarURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true,
          },
          {
            name: `Moderator:`,
            value: interaction.user.tag,
            inline: true,
          },
        ]);

      const banembedmember = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(`Du wurdest gebannt!\n\nServer: "${servername}"`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setThumbnail(guild.iconURL())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true,
          },
          {
            name: `Moderator:`,
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: `Information:`,
            value: `Bei Fragen wende dich bitte an die Projektleitung\n https://emergency-luedenscheid.de \n\n\nServer Join Link: https://discord.gg/QfDNMCxzsN`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde gebannt ✅`;
      await interaction.editReply({ content: newMessage });
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        interaction.guild,
        1
      );
      if (!guildSettings) {
        return resolve(null);
      }

      const modLogChannel = guildSettings.modLog;
      if (modLogChannel === undefined) {
        interaction.reply(
          `Mod-Log Channel nicht gefunden! Bot Einrichtung abschließen`
        );
        setTimeout(function () {
          interaction.deleteReply();
        }, 3000);
      } else {
        client.channels.cache
          .get(modLogChannel)
          .send({ embeds: [banembed] })
          .catch(console.error);
      }
      member
        .ban({ deleteMessageDays: days, reason: reason })
        .catch(console.error);

        try {
          await member.send({ embeds: [banembedmember] });
        } catch (error) {
        }  

      const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(interaction.guild, "ban", interaction.user, member.user, reason)

      return resolve(null);
    });
  },
};
