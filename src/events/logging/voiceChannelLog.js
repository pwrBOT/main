const { VoiceState, ChannelType, AuditLogEvent } = require("discord.js");
const userlogRepository = require("../../mysql/userlogRepository");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */

  async execute(oldState, newState, client) {
    return new Promise(async (resolve) => {
      const oldChannelId = oldState.channelId;
      const newChannelId = newState.channelId;
      const guild = await client.guilds.cache.get(newState.guild.id);
      const member = oldState.member || newState.member

      if (member == null) {
        return resolve(null)
      }

      // ############# USER-LOGGING ############## \\

      // USER JOINED CHANNEL
      if (oldChannelId === null && newChannelId !== null) {
        await userlogRepository.addLog(
          guild.id,
          member.id,
          "JOIN",
          "VC",
          "-",
          "-",
          newState.channelId,
          newState.channel.name
        );
      }
      // USER LEFT CHANNEL
      if (oldChannelId !== null && newChannelId === null) {
        let kicked = false;

        try {
          const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberDisconnect
          });

          const log = fetchedLogs.entries.first();

          const { executor } = log;
          if (executor && Date.now() - log.createdTimestamp < 4000) {
            kicked = true;

            await userlogRepository.addLog(
              guild.id,
              member.id,
              `KICKED BY ${executor?.tag ?? "Unkown"}`,
              "VC",
              oldState.channelId,
              oldState.channel.name,
              "-",
              "-"
            );
          }
        } catch (error) {}

        if (!kicked) {
          await userlogRepository.addLog(
            guild.id,
            member.id,
            "LEAVE",
            "VC",
            oldState.channelId,
            oldState.channel?.name ?? "*unknown Channel-Name*",
            "-",
            "-"
          );
        }
      }
      // USER CHANGED CHANNEL
      if (
        oldChannelId !== null &&
        newChannelId !== null &&
        oldChannelId != newChannelId
      ) {
        await userlogRepository.addLog(
          guild.id,
          member.id,
          "SWITCH",
          "VC",
          oldState.channelId,
          oldState.channel.name,
          newState.channelId,
          newState.channel.name,
        );
      }

      // ######################################### \\
    });
  }
};
