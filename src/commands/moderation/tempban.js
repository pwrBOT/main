const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const moment = require("moment");
const tempCommandRepository = require("../../mysql/tempCommandRepository");

module.exports = {
  name: "tempban",
  category: "moderation",
  description: "User vom Discord temp bannen",
  data: new SlashCommandBuilder()
    .setName(`tempban`)
    .setDescription(`User temporär vom Server bannen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User der gebannt werden soll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("length")
        .setDescription("Wie lange soll der User gebannt werden?")
        .setRequired(true)
        .addChoices(
          { name: "1 Woche", value: "1 Woche" },
          { name: "2 Wochen", value: "2 Wochen" },
          { name: "1 Monat", value: "1 Monat" },
          { name: "3 Monate", value: "3 Monate" },
          { name: "6 Monate", value: "6 Monate" },
          { name: "1 Jahr", value: "1 Jahr" },
          { name: "2 Jahre", value: "2 Jahre" },
          { name: "3 Jahre", value: "3 Jahre" }
        )
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
      const length = options.getString("length");
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const days = options.getString("delete");
      const servername = guild.name;

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      const getTempBanUser = await tempCommandRepository.getTempBanUser(member);
      if (getTempBanUser) {
        interaction.editReply(
          `❌ ${member} hat bereits einen Temp-Ban erhalten! ❌\nLäuft ab am ${new Date(
            getTempBanUser.tempEnd
          ).toLocaleDateString("de-DE")} um ${new Date(
            getTempBanUser.tempEnd
          ).toLocaleTimeString(["de-DE"], {
            hour: "2-digit",
            minute: "2-digit",
          })} Uhr`
        );
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

      const guildsRepository = require("../../mysql/guildsRepository");
      const embedInfo = await guildsRepository.getGuildSetting(
        guild,
        "embedinfo"
      );
      if (!embedInfo) {
        embedInfo = "Bei Fragen wende dich an die Communityleitung!";
      }

      var unbanDate = "";
      if (length === "1 Woche") {
        unbanDate = moment(new Date()).add(1, "week");
      } else if (length === "2 Wochen") {
        unbanDate = moment(new Date()).add(2, "weeks");
      } else if (length === "1 Monat") {
        unbanDate = moment(new Date()).add(1, "month");
      } else if (length === "3 Monate") {
        unbanDate = moment(new Date()).add(3, "months");
      } else if (length === "6 Monate") {
        unbanDate = moment(new Date()).add(6, "months");
      } else if (length === "1 Jahr") {
        unbanDate = moment(new Date()).add(1, "years");
      } else if (length === "2 Jahre") {
        unbanDate = moment(new Date()).add(2, "years");
      } else if (length === "3 Jahre") {
        unbanDate = moment(new Date()).add(3, "years");
      }

      const banembed = new EmbedBuilder()
        .setTitle(`⚡️ Moderation ⚡️`)
        .setDescription(
          `Temp-Ban für User: ${member} ausgesprochen!\nID: ${member.id}`
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
            name: `Moderator:`,
            value: interaction.user.username,
            inline: true,
          },
          {
            name: `Grund:`,
            value: `${reason}`,
            inline: true,
          },
          {
            name: `Ban-Information:`,
            value: `Dauer: ${length}\nFreigabe: ${new Date(
              unbanDate
            ).toLocaleDateString("de-DE")}`,
            inline: false,
          },
        ]);

      const banembedmember = new EmbedBuilder()
        .setTitle(`⚡️ Moderation ⚡️`)
        .setDescription(
          `Du hast einen Temp-Ban bekommen!\n\nServer: "${servername}"`
        )
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
            value: interaction.user.username,
            inline: true,
          },
          {
            name: `Ban-Information:`,
            value: `Dauer: ${length}\nFreigabe: ${new Date(
              unbanDate
            ).toLocaleDateString("de-DE")}`,
            inline: false,
          },
          {
            name: `Information:`,
            value: `${embedInfo}`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde gebannt ✅`;
      await interaction.editReply({ content: newMessage });
      try {
        setTimeout(function() {
          interaction.deleteReply().catch(error => {});;
        }, 5000);
      } catch (error) {}

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", banembed);

      const tempEnd = unbanDate.format();

      await tempCommandRepository.addTempCommandUser(
        interaction.guild.id,
        member.id,
        member.user.username,
        reason,
        interaction.user.username,
        interaction.user.id,
        "tempban",
        tempEnd
      );
      member
        .ban({ deleteMessageSeconds: days * 24 * 60 * 60, reason: reason })
        .catch(console.error);
      try {
        await member.send({ embeds: [banembedmember] }).catch(error => {});
      } catch (error) {}

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "tempban",
        interaction.user,
        member.user,
        reason
      );
      return resolve(null);
    });
  },
};
