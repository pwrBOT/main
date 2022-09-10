const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const { request } = require("undici");
const usersRepository = require("../../mysql/usersRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");

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

const av = {
  size: 512,
  x: 50,
  y: 50,
};

const generateImage = async (interaction, member, guild) => {
  return new Promise(async (resolve) => {
    const discriminator = member.discriminator;

    const user = await usersRepository.getUser(member.id, guild.id);

    if (!user) {
      return resolve(null);
    }
    var backgroundImg = "";
    const guildSettings = await guildSettingsRepository.getGuildSettings(guild);
    if (guildSettings.rankcard) {
      backgroundImg = `./src/components/canvas/img/welcome/${guildSettings.rankcard}`;
    } else {
      backgroundImg = "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
        
    }

    const canvas = Canvas.createCanvas(700, 350);
    const context = canvas.getContext("2d");

    // draw in the background
    const background = await Canvas.loadImage(backgroundImg);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    const { body } = await request(
      member.displayAvatarURL({ extension: "png", size: av.size, dynamic: false})
    );
    const avatar = await Canvas.loadImage(await body.arrayBuffer());

    const userName = (canvas, text) => {
      const context = canvas.getContext("2d");
      let fontSize = 50;
      do {
        context.font = `${(fontSize -= 9)}px Doctor Glitch`;
      } while (context.measureText(text).width > canvas.width - 400);
      return context.font;
    };

    context.strokeStyle = "#414141";
    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#ffffff";

    const memberDisplayName = `${member.username}#${member.discriminator}`;
    
    context.textAlign = "center";
    context.font = userName(canvas, memberDisplayName);
    context.fillText(`Herzlich Willkommen @${memberDisplayName}`, 350, 270);

    context.font = "20px Roboto Bold";
    context.fillText(`Du bist Member #${user.ID}`, 350, 300);

    // Pick up the pen
    context.beginPath();
    // Start the arc to form a circle
    context.arc(350, 130, 100, 0, Math.PI * 2, true);
    // Put the pen down
    context.closePath();
    // Clip off the region you drew on
    context.clip();
    context.drawImage(avatar, 250, 30, 200, 200);

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "welcome.png",
    });

    return resolve(attachment);
  });
};

module.exports.generateImage = generateImage;
