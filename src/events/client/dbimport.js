/**
const config = require(`../../../config.json`);
const usersRepository = require("../../mysql/usersRepository");
const fs = require("fs");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    return new Promise(async (resolve) => {
      const exportData = require("./extract.json");

      exportData.forEach(async (member) => {
        const mee6Level = await member.level;

        let xpImport = "";
        if (
          mee6Level == 0 ||
          mee6Level == 1 ||
          mee6Level == 2 ||
          mee6Level == 3 ||
          mee6Level == 4 ||
          mee6Level == 5
        ) {
          xpImport = 100;
        } else if (
          mee6Level == 6 ||
          mee6Level == 7 ||
          mee6Level == 8 ||
          mee6Level == 9 ||
          mee6Level == 10 ||
          mee6Level == 11 ||
          mee6Level == 12
        ) {
          xpImport = 1200;
        } else if (
          mee6Level == 13 ||
          mee6Level == 14 ||
          mee6Level == 15 ||
          mee6Level == 16 ||
          mee6Level == 17 ||
          mee6Level == 18 ||
          mee6Level == 19
        ) {
          xpImport = 2200;
        } else if (
          mee6Level == 20 ||
          mee6Level == 21 ||
          mee6Level == 22 ||
          mee6Level == 23
        ) {
          xpImport = 4200;
        } else if (
          mee6Level == 24 ||
          mee6Level == 25 ||
          mee6Level == 26 ||
          mee6Level == 27 ||
          mee6Level == 28 ||
          mee6Level == 29 ||
          mee6Level == 30
        ) {
          xpImport = 6200;
        }

        username = `${member.username}%`
        await usersRepository.importUserXp(xpImport, username);
        console.log(`${member.username} -> ${xpImport}`)
      });
      console.log("User xP wurden importiert");
      return resolve(null);
    });
  },
};
 */