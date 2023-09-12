const reportMap = new Map();

const check = async (member) => {
  return new Promise(async (resolve) => {
    if (waitMap.has(member.id)) {

      return resolve(true);
    } else {
      waitMap.set(member.id);

      setTimeout(() => {
        waitMap.delete(member.id);
      }, 120000);

      return resolve(false);
    }
  });
};

module.exports.check = check;
