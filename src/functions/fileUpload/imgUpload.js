const { ImgurClient } = require("imgur");

const upload = async imgLink => {
  if (!imgLink) {
    return;
  }

  const imgUrClient = new ImgurClient({
    clientId: "435a6f19b61d480",
    clientSecret: "ac40a7bd77cfb97403653d5c03002023c1afdcd6"
  });

  const uploadedFile = await imgUrClient.upload({
    image: imgLink,
    type: "stream",
  });
  
  return uploadedFile.data
};

module.exports.upload = upload;
