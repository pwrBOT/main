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

const generateImage = async (interaction, member, guild) => {
  return new Promise(async (resolve) => {
    // ###################### RANK ######################## \\

    const users = await usersRepository.getUsers(guild.id);

    if (!users) {
      interaction.editReply("❌ Keine User gefunden ❌");
    }

    const teamRoleId = await guildsRepository.getGuildSetting(
      guild,
      "teamRole"
    );

    const teamRole = await guild.roles.fetch(teamRoleId.value);

    let usersWOTeam = [];
    await users.forEach(async (user) => {
      let member = "";
      try {
        member = await guild.members.fetch(user.userId);
      } catch (error) {}

      if (member) {
        if (
          member.roles.cache.find((role) => role.id == teamRole.id) ||
          member.roles.cache.find((role) => role.id == "947612291833143337") ||
          member.user.bot === true
        ) {
        } else {
          usersWOTeam.push(user);
        }
      }
    });

    const sorting = (a, b) => {
      return b.xP - a.xP;
    };

    sortedUsers = usersWOTeam.sort(sorting);

    let leaderboardIndex = "";
    let leaderboardUsername = "";
    let leaderboardXP = "";

    await sortedUsers.slice(0, 25).forEach((user, index) => {
      const userIndex = index + 1;
      leaderboardIndex += `${userIndex}\n`;
      leaderboardUsername += `${user.userName}\n`;

      if (user.totalVoiceTime == 0) {
        leaderboardXP += `${user.xP} XP\t/\t"-"\n`;
      } else if (user.totalVoiceTime > 60) {
        const voiceTime = user.totalVoiceTime / 60;
        leaderboardXP += `${user.xP} XP\t/\t${voiceTime.toFixed(1)} Stunden\n`;
      } else {
        const voiceTime = user.totalVoiceTime;
        leaderboardXP += `${user.xP} XP\t/\t${voiceTime} Minuten\n`;
      }
    });

    // ##################################################### \\

    var backgroundImg = "https://www.teahub.io/photos/full/134-1348916_space-wallpaper-png.jpg";

    const canvas = Canvas.createCanvas(2000, 2000);
    const context = canvas.getContext("2d");

    // draw in the background
    const background = await Canvas.loadImage(backgroundImg);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    const leaderboardTitle = `Leaderboard | ${guild.name}`;

    const title = (canvas, text) => {
      const context = canvas.getContext("2d");
      let fontSize = 80;
      do {
        context.font = `${(fontSize -= 10)}px Doctor Glitch`;
      } while (context.measureText(text).width > canvas.width - 300);
      return context.font;
    };

    context.strokeStyle = "#414141";
    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#ffffff";

    context.font = title(canvas, leaderboardTitle);
    context.textAlign = "center";
    context.fillText(`${leaderboardTitle}`, 1000, 100);

    context.font = "40px Roboto Bold";
    context.textAlign = "left";
    context.fillText(`${leaderboardIndex} - ${leaderboardUsername} - ${leaderboardXP}`, 100, 200);

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: `${leaderboardTitle}.png`
    });

    return resolve(attachment);
  });
};

module.exports.generateImage = generateImage;
