const { ChannelType } = require("discord-api-types/v10");
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const ldsPlayersearchRepository = require("../../mysql/ldsPlayersearchRepository")
const tempChannelsRepository = require("../../mysql/tempChannelsRepository");

module.exports = {
    name: "suche",
    category: "game",
    description: "Luedenscheid Spielersuche Befehl",
    data: new SlashCommandBuilder()
        .setName(`suche`)
        .setDescription(`Erstellt automatisch eine Nachricht, einen Einsatzraum und moved dich rein.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
        .setDMPermission(false)
        .addStringOption((option) =>
            option
                .setName("spieler")
                .setDescription("Wie viele Spieler suchst du?")
                .addChoices(
                    { name: '1', value: '1' },
                    { name: '2', value: '2' },
                    { name: '3', value: '3' },
                    { name: '4', value: '4' },
                    { name: '5', value: '5' },
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("karte")
                .setDescription("Welche Karte wird gespielt?")
                .addChoices(
                    { name: 'Beliebig', value: 'Beliebig' },
                    { name: 'Brandstedt', value: 'Brandstedt' },
                    { name: 'Lüdenscheid', value: 'Lüdenscheid' },
                    { name: 'Linzing', value: 'Linzing' },
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("leitstelle")
                .setDescription("Welcher Modus?")
                .addChoices(
                    { name: 'Mit Leitstelle', value: 'Mit Leitstelle' },
                    { name: 'Ohne Leitstelle', value: 'Ohne Leitstelle' },
                )
                .setRequired(true)
        )
        // .addChannelOption((option) =>
        //     option
        //         .setName("channel")
        //         .setDescription("Channel:")
        //         .addChannelTypes(ChannelType.GuildVoice)
        //         .setRequired(true)
        // )
        .addStringOption((option) =>
            option
                .setName("anmerkung")
                .setDescription("Anmerkungen:")
                .setRequired(false)
        ),

    async execute(interaction, client) {
        return new Promise(async (resolve) => {
            await interaction.deferReply({
                ephemeral: false,
                fetchReply: true
            });

            const { member, guild } = interaction;

            const spieler = interaction.options.getString("spieler") || "-";
            const karte = interaction.options.getString("karte") || "-";
            const leitstelle = interaction.options.getString("leitstelle") || "-";
            const anmerkung = interaction.options.getString("anmerkung");
            let gamechannel = "";

            // ###################################################### \\

            await interaction.editReply({
                ephemeral: false,
                content: "Suchanfrage wird generiert / Einsatzraum wird vorbereitet..."
            });

            await createTempChannel()

            async function createSearchMessage(voiceChannel) {

                if (member.voice.channel) {
                    gamechannel = await member.voice.channel
                }

                if (voiceChannel) {
                    gamechannel = voiceChannel
                }

                if (!gamechannel) {
                    const checkMessage = await interaction.editReply({
                        ephemeral: true,
                        content: `Hey ${member.displayName} 😎\nDu bist in keinem Voice-Channel. In welchem Bereitschaftsraum möchtest du warten?`
                    });

                    checkMessage.react("1️⃣").then((r) => {
                        checkMessage.react("2️⃣");
                    });

                    const filter = (reaction, user) => {
                        return (
                            ["1️⃣", "2️⃣"].includes(reaction.emoji.name) &&
                            user.id === interaction.user.id
                        );
                    };

                    await checkMessage
                        .awaitReactions({
                            filter,
                            max: 1,
                            time: 10000,
                            errors: ["time"]
                        })
                        .then(async (collected) => {
                            const reaction = collected.first();

                            if (reaction.emoji.name === "1️⃣") {
                                gamechannel = await guild.channels.fetch("803686286846066712")
                                checkMessage.reactions.removeAll().catch(error => { })
                            } else {
                                gamechannel = await guild.channels.fetch("909823649056428082")
                                checkMessage.reactions.removeAll().catch(error => { })
                            }
                        })
                        .catch(async (collected) => {
                            gamechannel = await guild.channels.fetch("803686286846066712")
                            checkMessage.reactions.removeAll().catch(error => { })
                        });
                }

                const playerSearchCheck = await ldsPlayersearchRepository.getldsPlayersearchEntrybyChannel(guild.id, gamechannel.id)

                const channelMemberSize = gamechannel?.members?.size

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

                const playerSearchEmbed = new EmbedBuilder()
                    .setTitle(`🗣 ${member.displayName} sucht:`)
                    .addFields([
                        {
                            name: `📟 MODUS:`,
                            value: `${leitstelle}`,
                            inline: true
                        },
                        {
                            name: `🌍 KARTE:`,
                            value: `${karte}`,
                            inline: true
                        },
                        {
                            name: `🎮 GAME-CHANNEL:`,
                            value: `${gamechannel}`,
                            inline: true
                        }
                    ])
                    .setColor(0x0fbaff)
                    .setTimestamp(Date.now())
                    .setFooter({
                        iconURL: client.user.displayAvatarURL(),
                        text: `powered by Powerbot`
                    });


                if (karte == "Brandstedt") {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/516-suche-bst-v2-jpg/`)
                } else if (karte == "Lüdenscheid") {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/515-suche-lds-v2-jpg/`)
                } else if (karte == "Linzing") {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/512-suche-lnz-jpg/`)
                } else {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/514-suche-main-jpg/`)
                }

                if (anmerkung) {
                    playerSearchEmbed.addFields([
                        {
                            name: `💭 Anmerkungen:`,
                            value: `${anmerkung}`,
                            inline: false
                        },
                    ])
                }

                const message = await interaction.editReply({
                    ephemeral: false,
                    content: "",
                    embeds: [playerSearchEmbed],
                    components: [
                        new ActionRowBuilder().addComponents([
                            buttonPlayers,
                            buttonPlayersEnd
                        ])
                    ]
                });

                await ldsPlayersearchRepository.insertPlayersearchEntry(guild.id, member.id, message.id, message.channel.id, leitstelle, karte, anmerkung, spieler, gamechannel.id)



                const commandLogRepository = require("../../mysql/commandLogRepository");
                // guild - command, user, affectedMember, reason
                commandLogRepository.logCommandUse(
                    interaction.guild,
                    "lds search",
                    interaction.user,
                    "-",
                    "-"
                );
            }

            async function createTempChannel() {
                const newChannelName = `🚒 Einsatz #${member.displayName}`;
                let channelBitrate = "";
                let voiceChannel = null


                if (member.voice.channel) {

                    const checkMessage = await interaction.editReply({
                        ephemeral: true,
                        content: `Hey ${member.displayName} 😎\nMöchtest du gleich einen Einsatzraum erstellen und rein gemoved werden 🚀?`
                    });
                    checkMessage.react("✅").then((r) => {
                        checkMessage.react("❌");
                    });

                    const filter = (reaction, user) => {
                        return (
                            ["✅", "❌"].includes(reaction.emoji.name) &&
                            user.id === interaction.user.id
                        );
                    };

                    checkMessage
                        .awaitReactions({
                            filter,
                            max: 1,
                            time: 10000,
                            errors: ["time"]
                        })
                        .then(async (collected) => {
                            const reaction = collected.first();

                            if (reaction.emoji.name === "✅") {

                                checkMessage.reactions.removeAll().catch(error => { })

                                voiceChannel = await guild.channels
                                    .create({
                                        name: newChannelName,
                                        type: ChannelType.GuildVoice,
                                        bitrate: guild.maximumBitrate,
                                        parent: "970966930674577438",
                                        position: 1
                                    })
                                    .catch(console.error);

                                try {
                                    setTimeout(async () => {
                                        await voiceChannel.permissionOverwrites
                                            .edit(member, {
                                                ManageChannels: true,
                                                MoveMembers: true,
                                                ManageMessages: true,
                                                MuteMembers: false,
                                                ViewChannel: true,
                                                Connect: true,
                                                Speak: true,
                                                Stream: true
                                            })
                                            .catch((error) => { });
                                    }, 800);
                                } catch (error) { }

                                await tempChannelsRepository.addTempVoiceChannel(
                                    guild?.id,
                                    voiceChannel?.id,
                                    "temp",
                                    newChannelName,
                                    member.user.username,
                                    "-",
                                    "-"
                                );
                                await member.voice.setChannel(voiceChannel).catch(error => { })
                                createSearchMessage(voiceChannel)

                            } else {
                                checkMessage.reactions.removeAll().catch(error => { })
                                createSearchMessage(voiceChannel)
                            }
                        })
                        .catch(async (collected) => {
                            checkMessage.reactions.removeAll().catch(error => { })
                            createSearchMessage(voiceChannel)
                        });
                } else {
                    createSearchMessage(voiceChannel)
                }

            }
            return resolve(null);
        });
    }
};
