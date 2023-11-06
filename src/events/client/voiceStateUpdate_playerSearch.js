const {
    VoiceState,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildDefaultMessageNotifications
} = require("discord.js");

const ldsPlayersearchRepository = require("../../mysql/ldsPlayersearchRepository")

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState, client) {
        return new Promise(async (resolve) => {
            const guild = oldState.guild || newState.guild;
            const member = oldState.member || newState.member;

            const oldChannel = oldState.channel;
            const newChannel = newState.channel;

            if (newChannel) {
                const ldsPlayerSearchData = await ldsPlayersearchRepository.getldsPlayersearchEntrybyChannel(guild.id, newChannel.id)

                if (ldsPlayerSearchData) {

                    const spieler = ldsPlayerSearchData?.spielerzahl || "-"
                    const gamechannel = await guild.channels.fetch(ldsPlayerSearchData.channelId).catch(error => { })

                    const channelMemberSize = gamechannel?.members?.size

                    const searchMessageChannel = await guild.channels.fetch(ldsPlayerSearchData.messageChannelId).catch(error => { })
                    const searchMessage = await searchMessageChannel.messages.fetch(ldsPlayerSearchData.messageId).catch(error => { })

                    if (searchMessage) {

                        if (!gamechannel) {
                            const buttonPlayersEnd = new ButtonBuilder()
                                .setCustomId("ldsSearchPlayerButtonEnd")
                                .setLabel(`Suche automatisch beendet. Gamechannel gelöscht`)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true);

                            searchMessage.edit({
                                components: [
                                    new ActionRowBuilder().addComponents([
                                        buttonPlayersEnd
                                    ])
                                ]
                            });

                            await ldsPlayersearchRepository.updatePlayersearchEntry(guild.id, message.id)

                            return resolve(null)
                        }

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


                        searchMessage.edit({
                            components: [
                                new ActionRowBuilder().addComponents([
                                    buttonPlayers,
                                    buttonPlayersEnd
                                ])
                            ]
                        });
                    }
                }
            }

            if (oldChannel) {
                const ldsPlayerSearchData = await ldsPlayersearchRepository.getldsPlayersearchEntrybyChannel(guild.id, oldChannel.id)

                setTimeout(async function () {
                    if (ldsPlayerSearchData) {

                        const spieler = ldsPlayerSearchData?.spielerzahl || "-"
                        const gamechannel = await guild.channels.fetch(ldsPlayerSearchData.channelId).catch(error => { })

                        const channelMemberSize = gamechannel?.members?.size

                        const searchMessageChannel = await guild.channels.fetch(ldsPlayerSearchData.messageChannelId).catch(error => { })
                        const searchMessage = await searchMessageChannel.messages.fetch(ldsPlayerSearchData.messageId).catch(error => { })

                        if (searchMessage) {

                            if (!gamechannel) {
                                const buttonPlayersEnd = new ButtonBuilder()
                                    .setCustomId("ldsSearchPlayerButtonEnd")
                                    .setLabel(`Suche automatisch beendet. Gamechannel gelöscht`)
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true);

                                searchMessage.edit({
                                    components: [
                                        new ActionRowBuilder().addComponents([
                                            buttonPlayersEnd
                                        ])
                                    ]
                                });

                                return resolve(null)
                            }

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


                            searchMessage.edit({
                                components: [
                                    new ActionRowBuilder().addComponents([
                                        buttonPlayers,
                                        buttonPlayersEnd
                                    ])
                                ]
                            });
                        }
                    }
                }, 500)
            }


            return resolve(null);
        });
    }
};
