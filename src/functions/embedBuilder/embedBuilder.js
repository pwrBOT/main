const { EmbedBuilder } = require("discord.js");

module.exports.embedBuilderEmbed = embedBuilderEmbed;
module.exports.embedBuilderCreate = embedBuilderCreate;


const embedBuilderEmbed = async (colorCode, embedTitle, embedTitleUrl, embedDescription, embedAuthorName, embedAuthorIconUrl, embedAuthorUrl, embedThumbnailUrl, embedImageUrl) => {
const color = colorCode;
const title = embedTitle;
const titleUrl = embedTitleUrl;
const description = embedDescription;
const author = {
  name: embedAuthorName,
  icon_url: embedAuthorIconUrl,
  url: embedAuthorUrl
};
const thumbnail = {
  url: embedThumbnailUrl
};
const image = {
  url: embedImageUrl
};

const embedBuilderEmbed = {
	color: `0x${color}`,
	title: title,
	url: titleUrl,
	author: author,
	description: description,
	thumbnail: thumbnail,
	image: image,
	timestamp: Date.now(),
	footer: {
        iconURL: client.user.displayAvatarURL(),
        text: `powered by Powerbot`
      },
};
}

const embedBuilderCreate = async (embedBuilderEmbed) => {
    
}
