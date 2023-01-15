const fs = require("fs");

function appendZeroToLength(value, length) {
  return `${value}`.padStart(length, "0");
}

function getDateAsText() {
  const now = new Date();
  const nowText =
    appendZeroToLength(now.getUTCFullYear(), 4) +
    "." +
    appendZeroToLength(now.getUTCMonth() + 1, 2) +
    "." +
    appendZeroToLength(now.getUTCDate(), 2) +
    ", " +
    appendZeroToLength(now.getUTCHours(), 2) +
    ":" +
    appendZeroToLength(now.getUTCMinutes(), 2) +
    ":" +
    appendZeroToLength(now.getUTCSeconds(), 2) +
    " UTC";
  return nowText;
}

const log = async (text, fileName) => {
  return new Promise(async resolve => {
    const logText = getDateAsText() + " -> " + text + `\n`;

    // Save log to file.
    fs.appendFile(`./logging/${fileName}.log`, logText, "utf8", function(
      error
    ) {
      if (error) {
        // If error - show in console.
        console.log(getDateAsText() + " -> " + error);
      }
    });
    return resolve(null);
  });
};

module.exports.log = log;

