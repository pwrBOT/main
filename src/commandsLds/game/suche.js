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

module.exports = {
    name: "suche",
    category: "game",
    description: "Luedenscheid Spielersuche Befehl",
    data: new SlashCommandBuilder()
        .setName(`suche`)
        .setDescription(`Luedenscheid Spielersuche Befehl`)
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
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Channel:")
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        )
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
            const anmerkung = interaction.options.getString("anmerkung") || "-";
            let gamechannel = interaction.options.getChannel("channel") || "-";

            // ###################################################### \\

            if (member.voice.channel) {

                const checkMessage = await interaction.editReply({
                    ephemeral: true,
                    content: `Möchtest du gleich einen Einsatzraum erstellen?`
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
                            const einsatzraumChannel = await guild.channels.fetch("930490742600773642")

                            await member.voice.setChannel(einsatzraumChannel).catch(error => { })

                            checkMessage.reactions.removeAll().catch(error => { })

                            await interaction.editReply({
                                ephemeral: false,
                                content: "Einsatzraum wird erstellt! Du wirst gleich verschoben..."
                            });

                            setTimeout(function () {
                                createSearchMessage()
                            }, 1000)

                        } else {
                            checkMessage.reactions.removeAll().catch(error => { })
                            createSearchMessage()
                        }
                    })
                    .catch(async (collected) => {
                        checkMessage.reactions.removeAll().catch(error => { })
                        createSearchMessage()
                    });
            } else {
                createSearchMessage()
            }
            // ###################################################### \\

            async function createSearchMessage() {

                if (member.voice.channel) {
                    gamechannel = await member.voice.channel
                }

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
                    .setTitle(`Lüdenscheid | Spielersuche`)
                    .setDescription(`🗣 ${member.displayName} sucht:`)
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
                        }
                    ])
                    .setColor(0x0fbaff)
                    .setThumbnail(member.displayAvatarURL())
                    .setTimestamp(Date.now())
                    .setFooter({
                        iconURL: client.user.displayAvatarURL(),
                        text: `powered by Powerbot`
                    });

                if (anmerkung) {
                    playerSearchEmbed.addFields([
                        {
                            name: `💭 Anmerkungen:`,
                            value: `${anmerkung}`,
                            inline: false
                        },
                    ])
                }

                if (karte == "Brandstedt") {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/511-suche-bst-jpg/`)
                } else if (karte == "Lüdenscheid") {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/513-suche-lds-jpg/`)
                } else if (karte == "Linzing") {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/512-suche-lnz-jpg/`)
                } else {
                    playerSearchEmbed.setImage(`https://emergency-luedenscheid.de/media/514-suche-main-jpg/`)
                }

                if (gamechannel) {
                    playerSearchEmbed.addFields([
                        {
                            name: `➡️ Channel:`,
                            value: `${gamechannel}`,
                            inline: false
                        }
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

                const playerSearchCheck = await ldsPlayersearchRepository.getldsPlayersearchEntry(guild.id, gamechannel.id)

                if (playerSearchCheck == null) {
                    await ldsPlayersearchRepository.insertPlayersearchEntry(guild.id, member.id, message.id, message.channel.id, leitstelle, karte, anmerkung, spieler, gamechannel.id)
                }


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
            return resolve(null);
        });
    }
};
