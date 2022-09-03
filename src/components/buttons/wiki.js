module.exports = {
    data: {
        name: `wiki`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `https://wiki.emergency-luedenscheid.de`
        });
    }
}