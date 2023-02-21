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
    return new Promise(async resolve => {
      const oldChannelId = oldState.channelId;
      const newChannelId = newState.channelId;
      const guild = await client.guilds.cache.get(newState.guild.id);
      const member = await guild.members.cache.get(newState.id);

      // ############# USER-LOGGING ############## \\

      // USER JOINED CHANNEL
      if (oldChannelId === null && newChannelId !== null) {
        await userlogRepository.addLog(
          guild.id,
          member.id,
          "JOIN",
          "VC",
          "-",
          newChannelId
        );
      }
      // USER LEFT CHANNEL
      if (oldChannelId !== null && newChannelId === null) {
        const oldMember = await guild.members.cache.get(oldState.id);

        let kicked = false

        try {
          const fetchedLogs = await oldMember.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberDisconnect
          });

          const log = await fetchedLogs.entries.first()

          const { executor } = log;
          if (executor && Date.now() - log.createdTimestamp < 4000) {
            kicked = true
      
            await userlogRepository.addLog(
              guild.id,
              oldMember.id,
              `KICKED BY ${executor?.tag ?? "Unkown"}`,
              "VC",
              oldChannelId,
              "-"
            );
        }
        } catch (error) {}

        if (!kicked){
          await userlogRepository.addLog(
            guild.id,
            member.id,
            "LEAVE",
            "VC",
            oldChannelId,
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
          oldChannelId,
          newChannelId
        );
      }

      // ######################################### \\
    });
  }
};
