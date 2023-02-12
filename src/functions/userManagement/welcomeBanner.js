const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const usersRepository = require("../../mysql/usersRepository");
const guildSettings = require("../../mysql/guildsRepository");

//// ##################### REGISTER FONTS ##################### \\\\
const { join } = require("path");
const { GlobalFonts } = require("@napi-rs/canvas");
GlobalFonts.registerFromPath(
  join(__dirname, ".", "fonts", "Roboto-Light.ttf"),
  "Roboto Light"
);
GlobalFonts.registerFromPath(
  join(__dirname, ".", "fonts", "Roboto-Regular.ttf"),
  "Roboto Regular"
);
GlobalFonts.registerFromPath(
  join(__dirname, ".", "fonts", "Roboto-Bold.ttf"),
  "Roboto Bold"
);
GlobalFonts.registerFromPath(
  join(__dirname, ".", "fonts", "Doctor Glitch.otf"),
  "Doctor Glitch"
);

//// ##################### REGISTER END ##################### \\\\

const createWelcomeBanner = async (member, welcomeMessage) => {
  return new Promise(async resolve => {
    const welcomeBannerStatus = await guildSettings.getGuildSetting(
      member.guild,
      "welcomeMessageStatus"
    );

    if (welcomeBannerStatus) {
      if (welcomeBannerStatus.value !== "1") {
        return resolve(null);
      }
    }

    const av = {
      size: 512,
      x: 50,
      y: 50
    };

    const user = await usersRepository.getUser(member.id, member.guild.id);

    if (!user) {
      return resolve(null);
    }

    function isImage(url) {
      return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
    }

    var backgroundImg = "";
    const welcomeImage = await guildSettings.getGuildSetting(
      member.guild,
      "welcomeBannerPictureLink"
    );

    if (welcomeImage) {
      if (isImage(welcomeImage.value)) {
        backgroundImg = welcomeImage.value;
      } else {
        backgroundImg =
          "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
      }
    } else {
      backgroundImg =
        "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
    }

    const canvas = Canvas.createCanvas(700, 350);
    const context = canvas.getContext("2d");

    // draw in the background
    const background = await Canvas.loadImage(backgroundImg);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    // draw christmas overlay in the background
    /** 
    const powerbot_welcomeOverlay_christmas = await Canvas.loadImage(
      "./src/components/canvas/img/welcome/powerbot_welcomeOverlay_christmas.png"
    );
    context.drawImage(
      powerbot_welcomeOverlay_christmas,
      0,
      0,
      canvas.width,
      canvas.height
    );*/

    // draw overlay in the background
    const powerbot_welcomeOverlay = await Canvas.loadImage(
      "./src/components/canvas/img/welcome/powerbot_welcomeOverlay.png"
    );

    context.drawImage(
      powerbot_welcomeOverlay,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const avURL = member.displayAvatarURL({
      extension: "png",
      size: av.size,
      dynamic: false
    });
    const avatar = await Canvas.loadImage(await avURL);

    context.strokeStyle = "#414141";
    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#ffffff";

    const memberDisplayName = `${member.user.username}#${member.user
      .discriminator}`;

    context.textAlign = "center";
    context.font = "26px Roboto Light";
    context.fillText(`${welcomeMessage} @${memberDisplayName}`, 350, 270);

    context.font = "18px Roboto Light";
    context.fillText(`Du bist Member #${user.ID}`, 350, 300);

    context.beginPath();
    ///// links - oben - radius - ?  >> Wird von Mitte aus gezeichnet
    context.arc(350, 130, 80, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    ///// links - oben - breite - höhe >> links + radius = links | oben + radius = pfad oben
    context.drawImage(avatar, 270, 50, 160, 160);

    const filenname = `welcome_${member.user.username}.png`;
    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: filenname
    });

    const welcomeChannelId = await guildSettings.getGuildSetting(
      member.guild,
      "welcomechannel"
    );

    const welcomeChannelMessageDB = await guildSettings.getGuildSetting(
      member.guild,
      "welcomeChannelMessage"
    );

    let welcomeChannelMessage = "";

    if (!welcomeChannelMessageDB) {
      welcomeChannelMessage = `Hey ${member} 😎 | Herzlich Willkommen bei **${member
        .guild.name}**!`;
    } else {
      welcomeChannelMessage = welcomeChannelMessageDB.value
        .replace("{member}", `${member}`)
        .replace("{servername}", `${member.guild.name}`);
    }

    if (welcomeChannelId) {
      if (welcomeChannelId.value) {
        const welcomeChannel = await member.guild.client.channels.fetch(
          welcomeChannelId.value
        );
        welcomeChannel.send(welcomeChannelMessage);
        welcomeChannel.send({ files: [attachment] }).catch(console.error);
      }
    }
    return resolve(null);
  });
};

module.exports.createWelcomeBanner = createWelcomeBanner;
