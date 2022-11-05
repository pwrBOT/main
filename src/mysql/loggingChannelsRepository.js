const guildsRepository = require("./guildsRepository");

const logChannel = async (guild, property, logEmbed) => {
  return new Promise(async (resolve) => {
    const data = await guildsRepository.getGuildSetting(guild, property);

    if (!data) {
      return resolve(null);
    } else {
      const logChannel = data.value;

      if (logChannel === undefined) {
        return resolve(null);
      } else {
        guild.client.channels.cache
          .get(logChannel)
          .send({ embeds: [logEmbed] })
          .catch(console.error);
        return resolve(null);
      }
    }
  });
};

const logModal = async (guild, property, logEmbed) => {
  return new Promise(async (resolve) => {
    const data = await guildsRepository.getGuildSetting(guild, property);

    if (!data) {
      return resolve(null);
    } else {
      const logChannel = data.value;

      if (logChannel === undefined) {
        return resolve(null);
      } else {
        const message = await guild.client.channels.cache
          .get(logChannel)
          .send({ embeds: [logEmbed] })
          .catch(console.error);
          message.react('🙋‍♂️');
          message.react('✅');

          const filter = (reaction, user) => {
            return ['🙋‍♂️', '✅'].includes(reaction.emoji.name) && user.id === interaction.user.id;
          };
          message.awaitReactions({ filter, max: 2, time: 60000, errors: ['time'] })
          .then(collected => {
            const reaction_1 = collected.first();
            const reaction_2 = collected.second();
        
            if (reaction_1.emoji.name === '🙋‍♂️') {
              message.reply(`Anfrage wurde übernommen.`);
            };

            if (reaction_2.emoji.name === '✅') {
              message.reply('Abgeschlossen');
            };
          })
          .catch(collected => {" "});
        return resolve(null);
      }
    }
  });
};


// const logChannel = require("../mysql/loggingChannelsRepository")
// await logChannel.logChannel(interaction.guild, "modLog", LogEmbed)
module.exports.logChannel = logChannel;
module.exports.logModal = logModal;
