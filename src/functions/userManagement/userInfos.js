const userlogRepository = require("../../mysql/userlogRepository");
const warnsRepository = require("../../mysql/warnsRepository");

const getUserVCActivity = async (member, guild) => {
  return new Promise(async (resolve) => {
    let userVCActivity = "";
    const lastUserVCActivitys = await userlogRepository.getLogsByType(
      member,
      "VC",
      10
    );

    if (lastUserVCActivitys.length === 0) {
      userVCActivity = "Keine Aktivität vorhanden";
      return resolve(userVCActivity);
    }

    for (const activity of lastUserVCActivitys) {
      const date = new Date(activity.timestamp).toLocaleDateString("de-DE");
      const time = new Date(activity.timestamp).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
      });

      let channel = "";
      if (activity.action == "JOIN") {
        channel = await guild.channels
          .fetch(activity.newState)
          .catch((error) => {});
      } else if (activity.action == "LEAVE") {
        channel = await guild.channels
          .fetch(activity.oldState)
          .catch((error) => {});
      } else if (activity.action == "SWITCH") {
        channel = await guild.channels
          .fetch(activity.newState)
          .catch((error) => {});
      } else if (activity.action.startsWith("KICKED BY")) {
        channel = await guild.channels
          .fetch(activity.oldState)
          .catch((error) => {});
      } else {
        channel = "unbekannt";
      }

      userVCActivity += `${date} ${time}:\u00A0${
        activity.action
      }\u00A0\u00A0\u00A0(${channel?.name ?? "Nicht mehr vorhanden"})\n`;
    }

    return resolve(userVCActivity);
  });
};

const getCurrentWarns = async (member) => {
  let warnsText = "";
  let warns = await warnsRepository.getWarns(member, "active", -1);

  if (warns.length === 0) {
    warnsText = `Der User hat keine Verwarnungen!`;
  } else {
    warns.forEach((warn) => {
      const date = new Date(warn.warnAdd).toLocaleDateString("de-DE");
      const time = new Date(warn.warnAdd).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const spacer = `\u00A0\u00A0\u00A0\u00A0`;
      warnsText += `${date}  •  ${time}h:${spacer}${warn.warnReason}\n`;
    });
  }
  return warnsText;
};

const getOldWarns = async (member, guild, userData) => {
  let oldWarnsText = "";
  let oldWarns = await warnsRepository.getWarns(member, "removed", -1);

  if (oldWarns.length === 0) {
    oldWarnsText = `Der User hat keine gelöschten Verwarnungen!`;
  } else {
    oldWarns.forEach((oldWarn) => {
      const date = new Date(oldWarn.warnAdd).toLocaleDateString("de-DE");
      const time = new Date(oldWarn.warnAdd).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const spacer = `\u00A0\u00A0\u00A0\u00A0`;
      oldWarnsText += `${date}\u00A0•\u00A0${time}h:${spacer}Warngrund: ${oldWarn.warnReason}\u00A0|\u00A0\nLöschgrund: ${oldWarn.delReason}\n\n`;
    });
  }
  return oldWarnsText
};

const getVoiceTime = (userData) => {
  let totalVoiceTime = "";
  if (userData.totalVoiceTime > 60) {
    const voiceTime = userData.totalVoiceTime / 60;
    totalVoiceTime = `${voiceTime.toFixed(1)} Stunden`;
  } else {
    const voiceTime = userData.totalVoiceTime;
    totalVoiceTime = `${voiceTime} Minuten`;
  }

  return totalVoiceTime;
};

module.exports.getUserVCActivity = getUserVCActivity;
module.exports.getCurrentWarns = getCurrentWarns;
module.exports.getOldWarns = getOldWarns;
module.exports.getVoiceTime = getVoiceTime;