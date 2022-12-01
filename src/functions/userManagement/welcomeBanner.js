const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const { request } = require("undici");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const guildSettings = require("../../mysql/guildsRepository");

const createWelcomeBanner = async (member, welcomeMessage) => {
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
    y: 50
  };

  const user = await usersRepository.getUser(member.id, member.guild.id);

  if (!user) {
    return resolve(null);
  }
  var backgroundImg = "";

  const welcomeImage = await guildsRepository.getGuildSetting(
    member.guild,
    "welcomeImage"
  );
  if (welcomeImage) {
    backgroundImg = `./src/components/canvas/img/welcome/${welcomeImage.value}`;
  } else {
    backgroundImg = "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
  }

  const canvas = Canvas.createCanvas(700, 350);
  const context = canvas.getContext("2d");

  // draw in the background
  const background = await Canvas.loadImage(backgroundImg);
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  // draw overlay in the background
  const powerbot_welcomeOverlay = await Canvas.loadImage("./src/components/canvas/img/welcome/powerbot_welcomeOverlay.png");
  context.drawImage(powerbot_welcomeOverlay, 0, 0, canvas.width, canvas.height);

  const { body } = await request(
    member.displayAvatarURL({
      extension: "png",
      size: av.size,
      dynamic: false
    })
  );
  const avatar = await Canvas.loadImage(await body.arrayBuffer());

  context.strokeStyle = "#414141";
  context.strokeRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#ffffff";

  const memberDisplayName = `${member.user.username}#${member.user.discriminator}`;

  context.textAlign = "center";
  context.font = "30px Roboto Light";
  context.fillText(`${welcomeMessage} @${memberDisplayName}`, 350, 270);

  context.font = "18px Roboto Light";
  context.fillText(`Du bist Member #${user.ID}`, 350, 300);

  // Pick up the pen
  context.beginPath();
  // Start the arc to form a circle
  context.arc(350, 130, 80, 0, Math.PI * 2, true);
  // Put the pen down
  context.closePath();
  // Clip off the region you drew on
  context.clip();
  context.drawImage(avatar, 270, 50, 160, 160);

  const filenname = `welcome_${member.user.username}.png`;
  const attachment = new AttachmentBuilder(await canvas.encode("png"), {
    name: filenname
  });

  const welcomeChannelId = await guildSettings.getGuildSetting(
    member.guild,
    "welcomechannel"
  );

  if (welcomeChannelId.value) {
    const welcomeChannel = await member.guild.client.channels.cache.get(
      welcomeChannelId.value
    );
    welcomeChannel.send(`Hey ${member} 😎 | Herzlich Willkommen bei **${member.guild.name}**!`)
    welcomeChannel.send({ files: [attachment] }).catch(console.error);
  }
};

module.exports.createWelcomeBanner = createWelcomeBanner;
