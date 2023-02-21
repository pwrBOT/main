const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const schedule = require("node-schedule");
const youtube = require("../../functions/socialmedia/youtube");
const guildsRepository = require("../../mysql/guildsRepository");

const init = async client => {
  schedule.scheduleJob("*/5 * * * *", async function() {
    youtubeCheck(client);
  });
};

const youtubeCheck = async client => {
  const allBotGuilds = await client.guilds.cache.map(guild => guild);

  allBotGuilds.forEach(async guild => {
    let ytChannelLinkArray = [];
    try {
      const ytChannelLinks = await guildsRepository.getGuildSetting(
        guild,
        "ytChannelLinks"
      );
      ytChannelLinkArray = JSON.parse(ytChannelLinks.value);
    } catch (error) {}

    if (ytChannelLinkArray.length > 0) {
      ytChannelLinkArray.forEach(async link => {
        if (link.includes("youtube.com/channel/")) {
          youtube.check(client, guild, link);
        }
      });
    }
  });
};

module.exports.init = init;
