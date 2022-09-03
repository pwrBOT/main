const { VoiceState, PermissionsBitField } = require("discord.js");
const tempRepository = require("../../mysql/tempRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");
const tempChannels = require("../../mysql/tempChannels");


module.exports = {
    name: "voiceStateUpdate",
    /**
     * 
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState
     */

    async execute(oldState, newState, client) {
        const oldChannelId = oldState.channelId;
        const newChannelId = newState.channelId;
        const oldChannel = oldState.guild.channels.fetch(oldChannelId);
        const newChannel = newState.guild.channels.fetch(newChannelId);
        const member = client.users.fetch(newState.id)

        const tempChannelCheck = await tempChannels.getTempVoiceChannel(newState.guild.id, newChannelId);
        if (!tempChannelCheck) {
            return
        }

        console.log(member);
        console.log(member.username);

        const joinToCreate = tempChannelCheck.guildChannelId;
        const newChannelName = `Einsatzraum #${member.username}`;

        if (oldChannel !== newChannel && newChannelId === joinToCreate) {
            console.log("Ich bin hier")
            const voiceChannel = await newState.guild.channels.create(newChannelName, {
                type: 'GUILD_VOICE',
            });
            console.log(voiceChannel);
            client.voiceGenerator.set(member.id, voiceChannel.id);
            setTimeout(() => member.voice.setChannel(voiceChannel), 500);
        }
    }
}