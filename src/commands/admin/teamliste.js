const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require(`discord.js`);

const teamlistRepository = require("../../mysql/teamlistRepository");

module.exports = {
  name: "teamliste",
  category: "admin",
  description: "Teamliste generieren",
  data: new SlashCommandBuilder()
    .setName(`teamliste`)
    .setDescription(`Teamliste`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`add`)
        .setDescription(`Team-Liste erstellen`)
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "Channel auswählen wo die Teamliste gepostet werden soll"
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("teamrole1")
            .setDescription("1. Team Rolle")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("teamrole2")
            .setDescription("2. Team Rolle")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("teamrole3")
            .setDescription("3. Team Rolle")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("teamrole4")
            .setDescription("4. Team Rolle")
            .setRequired(false)
        )
        .addRoleOption((option) =>
          option
            .setName("teamrole5")
            .setDescription("5. Team Rolle")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`delete`)
        .setDescription(`Generierte Team-Liste löschen`)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { options, channel, guild } = interaction;

      const teamlistChannel = options.getChannel("channel");
      const teamRole1 = options.getRole("teamrole1") || "-";
      const teamRole2 = options.getRole("teamrole2") || "-";
      const teamRole3 = options.getRole("teamrole3") || "-";
      const teamRole4 = options.getRole("teamrole4") || "-";
      const teamRole5 = options.getRole("teamrole5") || "-";

      const testingGuilds = ["1135188214093729832", "396282694906150913"]

      if (options.getSubcommand() === "add") {
        // if (!testingGuilds.includes(guild.id)) {
        //   await interaction.reply({
        //     content: `❌ Dieses Feature befindet sich noch in Entwicklung. Du kannst es leider noch nicht nutzen. Sry :)`,
        //     ephemeral: true
        //   });
        //   return resolve(null);
        // }

        const teamlist = await teamlistRepository.getTeamlistSettings(guild);

        if (teamlist) {
          await interaction.reply({
            content: `❌ Es gibt bereits eine Teamliste in ${interaction.channel}`,
            ephemeral: true
          });
          return resolve(null);
        }

        let teamRoleMember1 = "";
        let teamRoleMember2 = "";
        let teamRoleMember3 = "";
        let teamRoleMember4 = "";
        let teamRoleMember5 = "";

        const sorting = (a, b) => {
          return a.joinedTimestamp - b.joinedTimestamp;
        };

        const sortedTeamRoleMembers1 = await teamRole1.members.sort(sorting);
        sortedTeamRoleMembers1.forEach((member) => {
          if (teamRole1.position === member.roles.highest.rawPosition) {
            teamRoleMember1 += `◽️ ${member.displayName}\n`;
          }
        });

        const sortedTeamRoleMembers2 = await teamRole2.members.sort(sorting);
        sortedTeamRoleMembers2.forEach((member) => {
          if (teamRole2.position === member.roles.highest.rawPosition) {
            teamRoleMember2 += `◽️ ${member.displayName}\n`;
          }
        });

        const sortedTeamRoleMembers3 = await teamRole3.members.sort(sorting);
        sortedTeamRoleMembers3.forEach((member) => {
          if (teamRole3.position === member.roles.highest.rawPosition) {
            teamRoleMember3 += `◽️ ${member.displayName}\n`;
          }
        });

        if (teamRole4 != "-") {
          const sortedTeamRoleMembers4 = await teamRole4.members.sort(sorting);
          sortedTeamRoleMembers4.forEach((member) => {
            if (teamRole4.position === member.roles.highest.rawPosition) {
              teamRoleMember4 += `◽️ ${member.displayName}\n`;
            }
          });
        }

        if (teamRole5 != "-") {
          const sortedTeamRoleMembers5 = await teamRole5.members.sort(sorting);
          sortedTeamRoleMembers5.forEach((member) => {
            if (teamRole5.position === member.roles.highest.rawPosition) {
              teamRoleMember5 += `◽️ ${member.displayName}\n`;
            }
          });
        }

        const teamlistEmbed = new EmbedBuilder()
          .setTitle(`${guild.name} | 👥 Team Übersicht:`)
          .setColor(0x0073ff)
          .setTimestamp(Date.now())
          .setThumbnail(guild.iconURL())
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `powered by Powerbot`
          });

        if (teamRoleMember1.length != 0) {
          teamlistEmbed.addFields({
            name: `**${teamRole1.name}:**`,
            value: `${teamRoleMember1}`,
            inline: false
          });
        }
        if (teamRoleMember2.length != 0) {
          teamlistEmbed.addFields({
            name: `**${teamRole2.name}:**`,
            value: `${teamRoleMember2}`,
            inline: false
          });
        }
        if (teamRoleMember3.length != 0) {
          teamlistEmbed.addFields({
            name: `**${teamRole3.name}:**`,
            value: `${teamRoleMember3}`,
            inline: false
          });
        }
        if (teamRoleMember4.length != 0) {
          teamlistEmbed.addFields({
            name: `**${teamRole4.name}:**`,
            value: `${teamRoleMember4}`,
            inline: false
          });
        }
        if (teamRoleMember5.length != 0) {
          teamlistEmbed.addFields({
            name: `**${teamRole5.name}:**`,
            value: `${teamRoleMember5}`,
            inline: false
          });
        }

        const teamlistMessage = await teamlistChannel
          .send({ embeds: [teamlistEmbed] })
          .catch((error) => {});

        await teamlistRepository.addTeamlistSettings(guild.id, 1, teamlistChannel.id, teamlistMessage.id, teamRole1.id, teamRole2.id, teamRole3.id, teamRole4.id, teamRole5.id);

        await interaction.reply({
          content: `✅ Teamliste in ${teamlistChannel} erstellt`,
          ephemeral: true
        });

        const commandLogRepository = require("../../mysql/commandLogRepository");
        // guild - command, user, affectedMember, reason
        await commandLogRepository.logCommandUse(
          interaction.guild,
          "teamlist add",
          interaction.user,
          "-",
          "-"
        );

        return resolve(null);
      }

      if (options.getSubcommand() === "delete") {
        const teamlist = await teamlistRepository.getTeamlistSettings(guild);

        if (!teamlist) {
          await interaction.reply({
            content: `❌ Es gibt keine Teamliste die du löschen kannst.`,
            ephemeral: true
          });
          return resolve(null);
        }

        const teamlistChannel = await guild.channels.fetch(
          teamlist.teamlistChannelId
        );
        const teamlistMessage = await teamlistChannel.messages.fetch(
          teamlist.messageId
        ).catch(error => {})

        if (teamlistMessage){
        await teamlistMessage.delete()
        }
        await teamlistRepository.deleteTeamlistSettings(guild);

        await interaction.reply({
          content: `✅ Die Teamliste wurde gelöscht.`,
          ephemeral: true
        });

        return resolve(null);
      }
    });
  }
};
