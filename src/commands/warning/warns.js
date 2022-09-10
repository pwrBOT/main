const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const warnsRepository = require("../../mysql/warnsRepository");

module.exports = {
  name: "warns",
  category: "warning",
  description: "Warns eines Users anzeigen lassen",
  data: new SlashCommandBuilder()
    .setName(`warns`)
    .setDescription(`Alle Warns eines Users anzeigen`)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("User").setRequired(true)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      var member = interaction.options.getMember("user");
      const channel = interaction.channel.id;
      const warns = await warnsRepository.getWarns(member, 10);

      if (!warns) {
        return resolve(null);
      }

      if (warns.length === 0) {
        interaction.reply(`${member} hat keine Verwarnungen!`);
        setTimeout(function () {
          interaction.deleteReply();
        }, 3000);
        return resolve(null);
      }

      var warnsText = "";
      warns.forEach((warn) => {
        const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
        const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const spacer = `\u00A0\u00A0\u00A0\u00A0`
        warnsText += `${date}  •  ${time}h:${spacer}${warn.warnReason}\n`;
      });

      const warnsembed = new EmbedBuilder()
        .setTitle(`⚡️ PowerBot | Warning-System ⚡️`)
        .setDescription(`Warns-Übersicht von ${member}`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by Powerbot`,
        })
        .addFields([
          {
            name: `Letzten 10 Verwarnungen:`,
            value: `${warnsText}`,
            inline: false,
          },
        ])
        .addFields([
          {
            name: `Angefordert von:`,
            value: `${interaction.user.tag}`,
            inline: false,
          },
        ]);
      interaction.reply(`..`);
      interaction.deleteReply();
      client.channels.cache.get(channel).send({ embeds: [warnsembed] });

      const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
      await commandLogRepository.logCommandUse(interaction.guild, "warns", interaction.user, member.user, "-")

      return resolve(null);
    });
  },
};
