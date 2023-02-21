const { EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("fs");
const guildsRepository = require("../../mysql/guildsRepository");
const fetch = require("node-fetch");

const check = async (client, guild, ytchannellink) => {
  const url = ytchannellink;
  const channelid = /[^/]*$/
    .exec(url)[0]
    .replaceAll("@", "")
    .replaceAll(`"`, ``);

  const feedurl = `https://youtube.com/feeds/videos.xml?channel_id=${channelid}`;
  const feedurlCheck = await fetch(feedurl);

  if (feedurlCheck.status == "404") {
    return;
  }

  const data = await parser.parseURL(feedurl).catch(error => {});

  if (data) {
    const filename = `${channelid}.json`;
    const path = `./src/functions/socialmedia/youtube/channels/${guild.id}/${filename}`;

    var dir = `./src/functions/socialmedia/youtube/channels/${guild.id}`;
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

    // CHECK IF FILE FOR YT-CHANNEL EXIST AND CREATE IF NOT
    if (!fs.existsSync(path)) {
      fs.appendFile(
        path,
        JSON.stringify({ id: data.items[0].id }),
        "utf8",
        function(error) {
          if (error) {
            console.log(getDateAsText() + " -> " + error);
          }
        }
      );
      return;
    }

    let jsonData = { id: "0" };

    try {
      const rawData = fs.readFileSync(path);
      if (rawData.length > 0) {
        jsonData = JSON.parse(rawData);
      }
    } catch (error) {}

    if (jsonData.id !== data.items[0].id) {
      const { title, link, id, author } = data.items[0];
      const youtubeEmbed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(`[➡️ ZUM VIDEO](${link})`)
        .setImage(`https://img.youtube.com/vi/${id.slice(9)}/maxresdefault.jpg`)
        .setColor(0x51ff00)
        .setTimestamp(Date.now())
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: `powered by PowerBot`
        });

      fs.writeFileSync(path, JSON.stringify({ id: data.items[0].id }));

      let messageContent = "";

      const socialPingRoleData = await guildsRepository.getGuildSetting(
        guild,
        "socialPingRole"
      );

      const socialPingRoleId = socialPingRoleData?.value ?? null

      if (socialPingRoleId){
        const socialPingRole = await guild.roles.fetch(socialPingRoleId)
        messageContent = `${socialPingRole}\n🎦 Neues YouTube Video von ${author}:\n`
      } else {
        messageContent = `🎦 Neues YouTube Video von ${author}:\n`
      }
      
      const socialPostChannelId = await guildsRepository.getGuildSetting(
        guild,
        "socialPostChannel"
      );

      let socialPostChannel = await guild.channels.fetch(
        socialPostChannelId.value
      ) ?? null

      if (socialPostChannel) {
        await socialPostChannel
          .send({
            content: messageContent,
            embeds: [youtubeEmbed]
          })
          .catch(error => {});
      }
    }
  }
};

module.exports.check = check;
