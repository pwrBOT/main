const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    discordSort
} = require("discord.js");

const ldsPlayersearchRepository = require("../../mysql/ldsPlayersearchRepository")

module.exports = {
    data: {
        name: `ldsSearchPlayerButton`
    },
    async execute(interaction) {
        return new Promise(async resolve => {
            const { guild, message, member } = interaction;

            const ldsPlayerSearchData = await ldsPlayersearchRepository.getldsPlayersearchEntry(guild.id, message.id)

            // if (interaction.member.id != "539513467313455105") {

            //     if (interaction.member.id != ldsPlayerSearchData?.memberId) {
            //         await interaction.reply({
            //             ephemeral: true,
            //             content: `Das ist nicht deine Suche...`
            //         });

            //         return resolve(null)
            //     }

            // }

            const reply = await interaction.reply({
                ephemeral: true,
                content: `⏳ ...`
            });

            reply.delete().catch(error => { })

            const spieler = ldsPlayerSearchData?.spielerzahl || "-"
            const gamechannel = await guild.channels.fetch(ldsPlayerSearchData.channelId).catch(error => { })

            if (!gamechannel) {
                const buttonPlayersEnd = new ButtonBuilder()
                    .setCustomId("ldsSearchPlayerButtonEnd")
                    .setLabel(`Suche automatisch beendet. Gamechannel gelöscht`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                message.edit({
                    components: [
                        new ActionRowBuilder().addComponents([
                            buttonPlayersEnd
                        ])
                    ]
                });

                await ldsPlayersearchRepository.updatePlayersearchEntry(guild.id, message.id)

                return resolve(null)
            }

            if (member.voice.channelId != gamechannel.id) {
                await member.voice.setChannel(gamechannel).catch(error => { })
            }

            const channelMemberSize = gamechannel?.members?.size

            // BUTTONS
            const buttonPlayers = new ButtonBuilder()
                .setCustomId("ldsSearchPlayerButton")
                .setLabel(`${channelMemberSize} / ${spieler} Spieler`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false);

            const buttonPlayersEnd = new ButtonBuilder()
                .setCustomId("ldsSearchPlayerButtonEnd")
                .setLabel(`Suche beenden`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false);


            message.edit({
                components: [
                    new ActionRowBuilder().addComponents([
                        buttonPlayers,
                        buttonPlayersEnd
                    ])
                ]
            });

            return resolve(null);
        });
    }
};
