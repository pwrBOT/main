const { EmbedBuilder } = require("discord.js");
const tempRepository = require("../../mysql/tempRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");
const tempChannels = require("../../mysql/tempChannels");
var client;


async function tempChannelCreate(oldState, newState, client) {
    return new Promise(async (resolve) => {
        const guildId = newState.guild.id;
        const channelId = newState.channelId;
        const channelPosition = newState.channel.position;
        const newChannelPosition = channelPosition + 1;
        const user = newState.member;

        const activeVC = await tempChannels.getTempVoiceChannel(guildId, channelId);
        if (!activeVC) {
            return resolve(null);
        }

        const newChannelName = `Einsatzraum #${newState.member.displayName}`;
        await newState.guild.channels.create(newChannelName, {
            type: 'GUILD_VOICE',
            bitrate: 256,
            position: newChannelPosition,
            permissionOverwrites: [
                {
                    id: message.author.id,
                    allow: [Permissions.FLAGS.MOVE_MEMBERS, Permissions.FLAGS.MANAGE_CHANNELS],
                },
            ],
        })
        const newChannel = newState.guild.channels.fetch(newChannelName)
        const newChannelId = newChannel.id
        user.setChannel(newChannelId)
        return resolve(null);
    })
}


module.exports.tempChannelCreate = tempChannelCreate;
