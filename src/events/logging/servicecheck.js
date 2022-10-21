const { EmbedBuilder } = require("discord.js");
const tempCommandRepository = require("../../mysql/tempCommandRepository");
var client;

async function ldsServiceCheck() {
  
}

async function init(_client) {
  client = _client;
  setInterval(ldsServiceCheck, 10000);
}

module.exports.init = init;
