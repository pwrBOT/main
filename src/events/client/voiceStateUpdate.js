const { VoiceState, PermissionFlagsBits, PermissionsBitField, ChannelType } = require("discord.js");
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
        const guild = client.guilds.cache.get(newState.guild.id);
        const member = guild.members.cache.get(newState.id);
        const oldChannel = oldState.guild.channels.fetch(oldChannelId);
        const newChannel = newState.guild.channels.fetch(newChannelId);


        const tempChannelCheck = await tempChannels.getTempVoiceChannel(guild.id, newChannelId);
        if (!tempChannelCheck) {
            return
        }

        const joinToCreate = tempChannelCheck.guildChannelId;
        const newChannelName = `Einsatzraum #${member.user.username}`;

        if (oldChannel !== newChannel && newChannelId === joinToCreate) {
            const voiceChannel = await guild.channels.create({
                name: newChannelName,
                type: ChannelType.GuildVoice,
                bitrate: '25600',
                parent: newState.channel.parent,
                permissionOverwrites: [
                    {
                        id: member.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                    },
                ],
            });
            client.voiceGenerator.set(member.user.id, voiceChannel.id);
            setTimeout(() => member.voice.setChannel(voiceChannel), 500);
        } else if (!newState.channel) {
            if (oldState.channel === voiceCollection.get(newState.id))
                return oldState.channel.delete();
        }
    }
}