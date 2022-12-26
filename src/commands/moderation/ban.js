const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

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
      const reason = options.getString("reason") || "Kein Grund angegeben";
      const days = options.getString("delete");
      const servername = guild.name;
      const affectedMember = options.getMember("user");
      let member = "";

      function containsOnlyNumbers(str) {
        return /^\d+$/.test(str);
      }

      if (containsOnlyNumbers(affectedMember)) {
        member = await client.users.cache.get(affectedMember);
        console.log(`Mit "ID" gebannt (${affectedMember} / member)`)
      } else {
        member = affectedMember;
      }

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

      const guildsRepository = require("../../mysql/guildsRepository");
      const embedInfo = await guildsRepository.getGuildSetting(
        guild,
        "embedinfo"
      );
      if (!embedInfo) {
        embedInfo = "Bei Fragen wende dich an die Communityleitung!";
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
            value: `${embedInfo}`,
            inline: false,
          },
        ]);

      const newMessage = `User ${member} wurde gebannt ✅`;
      await interaction.editReply({ content: newMessage });
      setTimeout(function () {
        interaction.deleteReply();
      }, 3000);

      const logChannel = require("../../mysql/loggingChannelsRepository");
      await logChannel.logChannel(interaction.guild, "modLog", banembed);

      member
        .ban({ deleteMessageSeconds: days * 24 * 60 * 60, reason: reason })
        .catch(console.error);

      try {
        await member.send({ embeds: [banembedmember] });
      } catch (error) {}

      const commandLogRepository = require("../../mysql/commandLogRepository");
      // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(
        interaction.guild,
        "ban",
        interaction.user,
        member.user,
        reason
      );

      return resolve(null);
    });
  },
};
