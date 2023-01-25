const waitMap = new Map();

const init = async (member, interaction) => {
  const TIME = 5000;

  if (waitMap.has(member.id)) {
    return "stop";
  } else {
    setTimeout(() => {
      waitMap.delete(member.id);
    }, TIME);
    waitMap.set(member.id, {
      timer: TIME
    });
    return "ok";
  }
};

module.exports.init = init;
