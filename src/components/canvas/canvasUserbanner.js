const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const usersRepository = require("../../mysql/usersRepository");
const guildsRepository = require("../../mysql/guildsRepository");

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
GlobalFonts.registerFromPath(
  join(__dirname, ".", "fonts", "DejavuSansBold.ttf"),
  "Doctor Glitch"
);

//// ##################### REGISTER END ##################### \\\\

const av = {
  size: 512,
  x: 50,
  y: 50
};

const generateImage = async (interaction, member, guild, guildMember) => {
  return new Promise(async resolve => {
    const discriminator = member.discriminator;

    const user = await usersRepository.getUser(member.id, guild.id);

    if (!user) {
      return resolve(null);
    }

    let totalVoiceTime = "";
    if (user.totalVoiceTime == 0) {
      totalVoiceTime = "";
    } else if (user.totalVoiceTime >= 1440) {
      const voiceTime = user.totalVoiceTime / 60 / 24;
      totalVoiceTime = `Zeit im VC: ≈ ${(voiceTime).toFixed(0)} Tage`;
    } else if (user.totalVoiceTime > 60) {
      const voiceTime = user.totalVoiceTime / 60;
      totalVoiceTime = `Zeit im VC: ${voiceTime.toFixed(1)} Stunden`;
    } else {
      const voiceTime = user.totalVoiceTime;
      totalVoiceTime = `Zeit im VC: ${voiceTime} Minuten`;
    }

    let totalMessages = "";
    if (user.messageCount == 0) {
      totalMessages = "";
    } else {
      totalMessages = `Nachrichten: ${user.messageCount}
      `
    }


    let currentUserXp = user.xP;
    let currentLevel = user.Level;
    let nextLevelXP = user.Level * user.Level * 100 + 100;

    function isImage(url) {
      return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
    }

    var backgroundImg = "";
    const rankBannerPictureLink = await guildsRepository.getGuildSetting(
      guild,
      "rankBannerPictureLink"
    );
    if (rankBannerPictureLink) {
      if (isImage(rankBannerPictureLink.value)) {
        backgroundImg = rankBannerPictureLink.value;
      } else {
        backgroundImg =
          "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
      }
    } else {
      backgroundImg =
        "./src/components/canvas/img/welcome/powerbot_rankcard.jpg";
    }

    const canvas = Canvas.createCanvas(700, 250);
    const context = canvas.getContext("2d");

    // draw in the background
    const background = await Canvas.loadImage(backgroundImg);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avURL = member.displayAvatarURL({
        extension: "png",
        size: av.size,
        dynamic: false
      })
    const avatar = await Canvas.loadImage(await avURL);

    const memberDisplayNameRaw = `${guildMember.displayName}`;
    const memberDisplayName = memberDisplayNameRaw.normalize("NFKD");

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

    context.font = userName(canvas, memberDisplayName);
    context.fillText(`${memberDisplayName}`, 200, 70);

    context.font = "17px Roboto Regular";
    context.fillText(`Server:  ${guild.name}`, 200, 100);
    context.fillText(
      `Rang:  ${interaction.member.roles.highest.name}`,
      200,
      120
    );

    context.fillText(
      `Auf dem Server seit: ${new Date(
        user.userAdd
      ).toLocaleDateString("de-DE")}`,
      200,
      140
    );

    context.fillText(
      `${totalMessages}${totalVoiceTime}`,
      200,
      170
    );

    context.font = "16px Roboto Bold";
    context.textAlign = "center";
    context.fillText(`Member #${user.ID}`, 100, 210);

    context.textAlign = "left";

    // XP Bar
    context.lineJoin = "round";
    context.lineWidth = 30;

    // Empty Bar
    context.strokeStyle = "black";
    context.strokeRect(215, 215, 350, 0);

    // Bar Filled
    context.strokeStyle = "#a7b9d7";
    context.strokeRect(215, 215, 350 * currentUserXp / nextLevelXP, 0);

    context.font = "18px Roboto Regular";
    context.fillStyle = "#444444";
    context.fillText(`XP: ${currentUserXp} / ${nextLevelXP}`, 300, 221);

    context.fillStyle = "#ffffff";
    context.font = "12px Roboto Regular";
    context.fillText(`LEVEL: ${currentLevel}`, 500, 195);

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
      name: `userbanner_${member.username}.png`
    });

    return resolve(attachment);
  });
};

module.exports.generateImage = generateImage;
