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



// const logChannel = require("../mysql/loggingChannelsRepository")
// await logChannel.logChannel(interaction.guild, "modLog", LogEmbed)
module.exports.logChannel = logChannel;
