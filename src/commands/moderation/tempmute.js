const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const moment = require("moment");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");
const tempRepository = require("../../mysql/tempRepository");

module.exports = {
  name: "tempmute",
  category: "moderation",
  description: "User vom Discord temp bannen",
  data: new SlashCommandBuilder()
    .setName(`tempmute`)
    .setDescription(`User temporär muten`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User der gemuted werden soll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("length")
        .setDescription("Wie lange soll der User gemuted werden?")
        .setRequired(true)
        .addChoices(
          { name: "12 Stunden", value: "12 Stunden" },
          { name: "1 Tag", value: "1 Tag" },
          { name: "1 Woche", value: "1 Woche" },
          { name: "2 Wochen", value: "2 Wochen" },
          { name: "1 Monat", value: "1 Monat" },
          { name: "3 Monate", value: "3 Monate" },
          { name: "6 Monate", value: "6 Monate" },
          { name: "1 Jahr", value: "1 Jahr" }
        )
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
      const servername = guild.name;

      const guildSettings = await guildSettingsRepository.getGuildSettings(
        interaction.guild,
        1
      );
      if (!guildSettings) {
        return resolve(null);
      }

      if  (!guildSettings.muteRole) {
        interaction.editReply(
          "❌ Keine Mute-Rolle festgelegt | Mute nicht möglich ❌"
        );
        return resolve(null);
      }

      const muteRoleId = guildSettings.muteRole;
      const muteRole = interaction.guild.roles.cache.get(muteRoleId);

      if (!member) {
        interaction.editReply("❌ Der User ist nicht mehr auf dem Server ❌");
        return resolve(null);
      }

      const getTempMuteUser = await tempRepository.getTempMuteUser(member);
      if (getTempMuteUser) {
        interaction.editReply(
          `❌ ${member} ist bereits gemuted! ❌\nLäuft ab am ${new Date(
            getTempMuteUser.tempEnd
          ).toLocaleDateString("de-DE")} um ${new Date(
            getTempMuteUser.tempEnd
          ).toLocaleTimeString(["de-DE"], {
            hour: "2-digit",
            minute: "2-digit",
          })} Uhr`
        );
        return resolve(null);
      }

      if (member.id === user.id) {
        interaction.editReply("❌ Du kannst dich nicht selber muten! ❌");
        return resolve(null);
      }

      if (member.id === client.user.id) {
        interaction.editReply("❌ Du kannst den Bot nicht muten! ❌");
        return resolve(null);
      }

      if (guild.ownerId === member.id) {
        interaction.editReply("❌ Du kannst den Serverinhaber nicht muten! ❌");
        return resolve(null);
      }

      if (member.manageable === false) {
        interaction.editReply(
          "❌ Du hast hat zuwenig Power um den Befehl auszuführen ❌"
        );
        return resolve(null);
      }

      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        interaction.editReply("❌ Du kannst keinen Admin muten! ❌");
        return resolve(null);
      }

      var unmuteDate = "";
      if (length === "12 Stunden") {
        unmuteDate = moment(new Date()).add(12, "hours");
      } else if (length === "1 Tag") {
        unmuteDate = moment(new Date()).add(1, "day");
      } else if (length === "1 Woche") {
        unmuteDate = moment(new Date()).add(1, "week");
      } else if (length === "2 Wochen") {
        unmuteDate = moment(new Date()).add(2, "weeks");
      } else if (length === "1 Monat") {
        unmuteDate = moment(new Date()).add(1, "month");
      } else if (length === "3 Monat") {
        unmuteDate = moment(new Date()).add(3, "months");
      } else if (length === "6 Monat") {
        unmuteDate = moment(new Date()).add(6, "months");
      } else if (length === "1 Jahr") {
        unmuteDate = moment(new Date()).add(1, "year");
      }

      const muteembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(
          `Temp-Mute für User: ${member} ausgesprochen!\nID: ${member.id}`
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
            value: interaction.user.tag,
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
              unmuteDate
            ).toLocaleDateString("de-DE")} | ${new Date(
              unmuteDate
            ).toLocaleTimeString("de-DE")}`,
            inline: false,
          },
        ]);

      const muteembedmember = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
        .setDescription(
          `Du hast ein Temp-Mute bekommen!\n\nServer: "${servername}"`
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
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: `Mute-Information:`,
            value: `Dauer: ${length}\nFreigabe: ${new Date(
              unmuteDate
            ).toLocaleDateString("de-DE")} | ${new Date(
              unmuteDate
            ).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })} Uhr`,
            inline: false,
          },
          {
            name: `Information:`,
            value: `Bei Fragen wende dich bitte an die Projektleitung!`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde gemuted ✅`;
      await interaction.editReply({ content: newMessage });
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);

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
          .send({ embeds: [muteembed] })
          .catch(console.error);
      }

      const tempEnd = unmuteDate.format();

      await tempRepository.addTempCommandUser(
        interaction.guild.id,
        member.id,
        member.user.tag,
        reason,
        interaction.user.username,
        interaction.user.id,
        "tempmute",
        tempEnd
      );
      member.roles.add(muteRole).catch(console.error);
      member.send({ embeds: [muteembedmember] }).catch(console.error);

      const powerbot_commandLog = require("../../mysql/powerbot_commandLog");
      // guild - command, user, affectedMember, reason
      await powerbot_commandLog.logCommandUse(
        interaction.guild,
        "tempmute",
        interaction.user,
        member.user,
        reason
      );
      return resolve(null);
    });
  },
};
