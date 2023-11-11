const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder
} = require("discord.js");

const ldsPlayersearchRepository = require("../../mysql/ldsPlayersearchRepository")

module.exports = {
    data: {
        name: `ldsSearchPlayerButtonEnd`
    },
    async execute(interaction) {
        return new Promise(async resolve => {
            const { guild, message } = interaction;

            const ldsPlayerSearchData = await ldsPlayersearchRepository.getldsPlayersearchEntry(guild.id, message.id)

            if (interaction.member.id != "539513467313455105") {

                if (interaction.member.id != ldsPlayerSearchData.memberId) {
                    await interaction.reply({
                        ephemeral: true,
                        content: `Das ist nicht deine Suche...`
                    });

                    return resolve(null)
                }
            }

            const spieler = ldsPlayerSearchData?.spielerzahl || "-"
            const gamechannel = await guild.channels.fetch(ldsPlayerSearchData.channelId).catch(error => { })

            const channelMemberSize = gamechannel?.members?.size

            // BUTTONS
            const buttonPlayers = new ButtonBuilder()
                .setCustomId("ldsSearchPlayerButton")
                .setLabel(`${channelMemberSize} / ${spieler} Spieler`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const buttonPlayersEnd = new ButtonBuilder()
                .setCustomId("ldsSearchPlayerButtonEnd")
                .setLabel(`Suche beendet`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            // ####### CHANGE EMBED ######## \\

            const oldEmbed = message.embeds[0]

            const newTitle = oldEmbed.title.slice(0, -1) + "e:"

            const playerSearchEmbedNew = new EmbedBuilder()
                    .setTitle(newTitle)
                    .addFields(oldEmbed.fields)
                    .setColor(oldEmbed.hexColor)
                    .setImage(oldEmbed.image.url)
                    .setTimestamp(new Date(oldEmbed.timestamp))
                    .setFooter(oldEmbed.footer);


            message.edit({
                embeds: [playerSearchEmbedNew],
                components: [
                    new ActionRowBuilder().addComponents([
                        buttonPlayersEnd
                    ])
                ]
            });

            await ldsPlayersearchRepository.updatePlayersearchEntry(guild.id, message.id)

            const reply = await interaction.reply({
                ephemeral: true,
                content: `⏳ UPDATE...`
            });

            reply.delete()

            return resolve(null);
        });
    }
};
