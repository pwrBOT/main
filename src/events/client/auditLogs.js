const { AuditLogEvent, Events } = require("discord.js");

module.exports = {
  name: "messageDelete",

  async execute(message) {
    return new Promise(async resolve => {

      return resolve(null)
    });
  }
};
