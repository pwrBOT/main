const {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "Activitys",
  category: "info",
  description: "Gemeinsam Aktivtäten ausführen (YouTube schauen, ...)",
  data: new SlashCommandBuilder()
    .setName(`activity`)
    .setDescription(`Gemeinsam Aktivtäten ausführen (YouTube schauen, ...)`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
    .addStringOption((option) =>
      option
        .setName("activity")
        .setDescription("Aktivität auswählen")
        .addChoices(
          { name: "YouTube", value: "1" },
          { name: "Schach", value: "2" },
          { name: "Betrayal", value: "3" },
          { name: "Poker", value: "4" },
          { name: "Fish", value: "5" },
          { name: "Bobble", value: "6" },
          { name: "Word Snack", value: "7" },
          { name: "Sketchheads", value: "8" },
          { name: "Spell Cast", value: "9" },
          { name: "Land", value: "10" },
          { name: "Uno", value: "11" }
        )
        .setRequired(true)
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Client} client 
     */


  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      await interaction.deferReply({
        ephemeral: false,
        fetchReply: true,
      });

      const choice = interaction.options.getString("activity");
      const App = client.discordTogether;

      const VC = interaction.member.voice.channel;
      if (!VC) {
        interaction.editReply(
          "❌ Du musst ein einem Voice-Channel sein, um den Command nutzen zu können ❌"
        );
        return resolve(null);
      }

      switch (choice) {
        case "1": {
            App.createTogetherCode(VC.id, "youtube").then(invite => interaction.editReply(`Hier klicken um Youtube Together zu joinen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "2": {
            App.createTogetherCode(VC.id, "chess").then(invite => interaction.editReply(`Hier klicken um gemeinsam Schach zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "3": {
            App.createTogetherCode(VC.id, "betrayal").then(invite => interaction.editReply(`Hier klicken um gemeinsam Betrayal zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "4": {
            App.createTogetherCode(VC.id, "poker").then(invite => interaction.editReply(`Hier klicken um gemeinsam Poker zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "5": {
            App.createTogetherCode(VC.id, "fishing").then(invite => interaction.editReply(`Hier klicken um gemeinsam Fishington zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "6": {
            App.createTogetherCode(VC.id, "bobble").then(invite => interaction.editReply(`Hier klicken um gemeinsam Bobble zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "7": {
            App.createTogetherCode(VC.id, "wordsnack").then(invite => interaction.editReply(`Hier klicken um gemeinsam Wordsnack zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "8": {
            App.createTogetherCode(VC.id, "sketchheads").then(invite => interaction.editReply(`Hier klicken um gemeinsam Sketchheads zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "9": {
            App.createTogetherCode(VC.id, "spellcast").then(invite => interaction.editReply(`Hier klicken um gemeinsam Spellcast zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "10": {
            App.createTogetherCode(VC.id, "land").then(invite => interaction.editReply(`Hier klicken um gemeinsam Land zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;

        case "11": {
            App.createTogetherCode(VC.id, "ocho").then(invite => interaction.editReply(`Hier klicken um gemeinsam Uno zu spielen:\n ${invite.code}`))
            setTimeout(function () {interaction.deleteReply();}, 5000);
        } break;
      }


    });
  },
};
