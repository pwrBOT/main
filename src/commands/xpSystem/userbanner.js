const { SlashCommandBuilder } = require(`discord.js`);
const anvasUserbanner = require("../../components/canvas/canvasUserbanner");
const timeOutMap = new Map()

module.exports = {
  name: "userbanner",
  category: "info",
  description: "Banner mit eigenen Informationen generieren.",
  data: new SlashCommandBuilder()
    .setName(`userbanner`)
    .setDMPermission(false)
    .setDescription(`Userbanner anzeigen`),

  async execute(interaction) {

    /** 
    // ############ TIMEOUT COMMAND CHECK ############ \\
    if (timeOutMap.has(interaction.member.id)){
      interaction.reply({content:`⏰ Command Cooldown | Du kannst den Command nur alle 30 Minuten nutzen 🥱`});
      return resolve(null)
    } else {
      timeOutMap.set(interaction.member.id)
      setTimeout(() =>{
        timeOutMap.delete(interaction.member.id)
      }, 1800000)
    }
    // ################################################ \\

    */

    const img = await anvasUserbanner.generateImage(interaction, interaction.user, interaction.guild, interaction.member);

    if (!img) {
      return interaction.reply(`❌ Kein Userbanner verfügbar! Möglicherweise hast du bisher noch keine Nachricht geschrieben! ❌`);
    }

    interaction.reply({ files: [img] });

    const commandLogRepository = require("../../mysql/commandLogRepository");
                                          // guild - command, user, affectedMember, reason
    await commandLogRepository.logCommandUse(interaction.guild, "userbanner", interaction.user, "-", "-")
  },
};