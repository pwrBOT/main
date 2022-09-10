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
      backgroundImg =
        "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
    }

    let currentUserXp = user.xP;
    let currentLevel = "";
    let nextLevelXP = "";

    if (currentUserXp < 100) {
      currentLevel = 0;
      nextLevelXP = 100;
    } else if (currentUserXp < 1000) {
      currentLevel = 1;
      nextLevelXP = 1000;
    } else if (currentUserXp < 2000) {
      currentLevel = 2;
      nextLevelXP = 2000;
    } else if (currentUserXp < 4000) {
      currentLevel = 3;
      nextLevelXP = 4000;
    } else if (currentUserXp < 6000) {
      currentLevel = 4;
      nextLevelXP = 6000;
    } else if (currentUserXp < 10000) {
      currentLevel = 5;
      nextLevelXP = 10000;
    } else if (currentUserXp < 15000) {
      currentLevel = 6;
      nextLevelXP = 15000;
    } else if (currentUserXp < 20000) {
      currentLevel = 7;
      nextLevelXP = 20000;
    } else if (currentUserXp < 30000) {
      currentLevel = 8;
      nextLevelXP = 30000;
    } else if (currentUserXp < 50000) {
      currentLevel = 9;
      nextLevelXP = 50000;
    } else {
      currentLevel = 10;
      nextLevelXP = 100000;
    }

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
