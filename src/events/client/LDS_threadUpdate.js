module.exports = {
  name: "threadUpdate",

  async execute(oldThread, newThread) {
    return new Promise(async (resolve) => {

      // ############################# LDS ############################# \\

      /**
       * 1100514552992497694 = Gelöst
       * 1100514208799543417 = Installation
       * 1100515649333248092 = Launcher
       * */ 

      if (newThread.guildId == "396282694906150913") {

        if (newThread.appliedTags.includes("1100514552992497694")) {
          await newThread.setLocked(true).catch((error) => {});
          await newThread.setArchived(true).catch((error) => {});
        }
      }
    });
  }
};
