const { VoiceState } = require("discord.js");
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
        console.log("User in Voice Channel")
        const { member, guild } = newState;
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        console.log(newState.guild.id)
        console.log(newState.channelId)

        const tempChannelCheck = await tempChannels.getTempVoiceChannel(newState.guild.id, newState.channelId);
        if (!tempChannelCheck) {
            console.log("Kein Temp-Voice Channel")
            return resolve(null);
        }
        console.log(tempChannelCheck)
        console.log(tempChannelCheck.guildChannelId)
        console.log(newChannel.id)

        const joinToCreate = tempChannelCheck.guildChannelId;
        const newChannelName = `Einsatzraum #${member.user.tag}`;
        if (oldChannel !== newChannel && newChannel && newChannel.id === joinToCreate) {
            const voiceChannel = await guild.channels.create(newChannelName, {
                type: 'GUILD_VOICE',
                bitrate: 256,
                parent: newChannel.parent,
                permissionOverwrites: [
                    {
                        id: message.author.id,
                        allow: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.MOVE_MEMBERS, Permissions.FLAGS.MANAGE_CHANNELS],
                    },
                ],
            });

            client.voiceGenerator.set(member.id, voiceChannel.id);
            setTimeout(() => member.voice.setChannel(voiceChannel), 500);
            return resolve(null);
        }
    }
}