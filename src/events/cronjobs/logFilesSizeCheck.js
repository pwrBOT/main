const schedule = require("node-schedule");
const fs = require("fs");

const init = async () => {
  schedule.scheduleJob({ hour: 22, minute: 00 }, function() {
    const loggingFiles = fs
      .readdirSync(`./logging`)
      .filter(file => file.endsWith(".log"));

    console.log("\x1b[36m");
    console.log("#########################################################");
    console.log("################## LOGGING FILE CHECK ###################");
    console.log("#########################################################");
    console.log("\x1b[0m");

    for (const loggingFile of loggingFiles) {
      var messageDeleteStats = fs.statSync(`./logging/${loggingFile}`);
      var messageDeleteSize = messageDeleteStats.size / (1024 * 1000);

      if (messageDeleteSize < 10) {
      console.log(
        `\x1b[36m${loggingFile}: \x1b[32m${messageDeleteSize.toFixed(3)} MB\x1b[0m`
      );
    }

      if (messageDeleteSize >= 10) {
        console.log(
          `\x1b[31m ${loggingFile} hat die 10 MB Grenze überschritten!\x1b[0m`
        );
      }
    }
      console.log("\x1b[36m");
      console.log("#########################################################");
      console.log("\x1b[0m");
  });
};

module.exports.init = init;
