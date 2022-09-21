const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const { request } = require("undici");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");

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
  
    const rankcard = await guildsRepository.getGuildSetting(
      guild,
      "rankcard"
    );
    if (rankcard) {
      backgroundImg = `./src/components/canvas/img/welcome/${rankcard.value}`;
    } else {
      backgroundImg =
        "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
    }

    let currentUserXp = user.xP;
    let currentLevel = user.Level;
    let nextLevelXP = user.Level * user.Level * 100 + 100;

    const canvas = Canvas.createCanvas(700, 250);
    const context = canvas.getContext("2d");

    // draw in the background
    const background = await Canvas.loadImage(backgroundImg);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    const { body } = await request(
      member.displayAvatarURL({
        extension: "png",
        size: av.size,
        dynamic: false,
      })
    );
    const avatar = await Canvas.loadImage(await body.arrayBuffer());

    const userName = (canvas, text) => {
      const context = canvas.getContext("2d");
      let fontSize = 50;
      do {
        context.font = `${(fontSize -= 10)}px Doctor Glitch`;
      } while (context.measureText(text).width > canvas.width - 300);
      return context.font;
    };

    context.strokeStyle = "#414141";
    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#ffffff";

    const memberDisplayName = `${member.username} ${member.discriminator}`;
    context.font = userName(canvas, memberDisplayName);
    context.fillText(`${memberDisplayName}`, 200, 80);

    context.font = "20px Roboto Regular";
    context.fillText(`Server: ${guild.name}`, 200, 120);

    context.font = "20px Roboto Regular";
    context.fillText(
      `Rolle: ${interaction.member.roles.highest.name}`,
      200,
      145
    );

    context.font = "20px Roboto Light";
    context.fillText(
      `Level: ${currentLevel}    |    XP: ${currentUserXp} / ${nextLevelXP}`,
      200,
      185
    );

    context.font = "18px Roboto Bold";
    context.textAlign = "center";
    context.fillText(`Member #${user.ID}`, 100, 210);

    context.textAlign = "left";
    // Pick up the pen
    context.beginPath();
    // Start the arc to form a circle
    context.arc(100, 100, 75, 0, Math.PI * 2, true);
    // Put the pen down
    context.closePath();
    // Clip off the region you drew on
    context.clip();
    context.drawImage(avatar, 25, 25, 150, 150);

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "welcome.png",
    });

    return resolve(attachment);
  });
};

module.exports.generateImage = generateImage;
