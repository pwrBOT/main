const usersRepository = require("../../mysql/usersRepository");
const fetchAll = require("discord-fetch-all");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    return new Promise(async resolve => {
      let newMessage = "";

      if (
        message.author.id == "539513467313455105" &&
        message.content == "Nachrichten übertragen"
      ) {
        const messageChannel = message.channel;
        const botStatusMessage = messageChannel.send(
          "STATUS: Nachrichten werden gesammelt und zugeordnet..."
        );

        const allMessages = await fetchAll.messages(message.channel, {
          reverseArray: true, // Reverse the returned array
          userOnly: true, // Only return messages by users
          botOnly: false, // Only return messages by bots
          pinnedOnly: false // Only returned pinned messages
        });

        const messageMap = new Map();
        allMessages.forEach(async message => {
          if (messageMap.has(message.author.id)) {
            if (message.author.id) {
              const userData = await messageMap.get(message.author.id);
              const newMessageCount = userData.messages + 1;

              messageMap.get(message.author.id).messages = newMessageCount;
            }
          } else {
            if (message.author.id) {
              messageMap.set(message.author.id);
              const newMessageCount = 1;
              messageMap.set(message.author.id, {
                userName: message.author.username,
                userId: message.author.id,
                guildId: message.guild.id,
                messages: newMessageCount
              });
            }
          }
        });

        messageMap.forEach(async userData => {
          const guildMember = await usersRepository.getUser(
            userData.userId,
            userData.guildId
          );

          if (guildMember) {
            let newMessageCount = guildMember.messageCount + userData.messages;
            await usersRepository.updateUser(
              userData.guildId,
              userData.userId,
              "messageCount",
              newMessageCount
            );

            newMessage += `MESSAGECOUNT ÜBERTRAGEN | ${userData.userName}: ${userData.messages}\n`;

            console.log(
              `MESSAGECOUNT ÜBERTRAGEN | ${userData.userName}: ${userData.messages}`
            );
          }
        });

        message.channel.send(
          "STATUS: Nachrichten erfolgreich zugeordnet und übertragen..."
        );

        message.delete()
      }

      return resolve(null);
    });
  }
};
