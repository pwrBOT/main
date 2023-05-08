module.exports = {
  name: "threadCreate",

  async execute(thread) {
    return new Promise(async (resolve) => {

      // ############################# LDS ############################# \\

      /**
       * 1100514552992497694 = Gelöst
       * 1100514208799543417 = Installation
       * 1100515649333248092 = Launcher
       * */ 

      if (thread.guildId == "396282694906150913") {

        if (thread.appliedTags.includes("1100514208799543417")) {
          setTimeout(function() {
            thread.send("Möglicherweise hilft dir das weiter :)\nhttps://emergency-luedenscheid.de/wiki/lexicon/25-installation/").catch(error => {})
          }, 2000)
        }

        
      }
    });
  }
};
