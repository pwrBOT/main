const { ImgurClient } = require("imgur");

const upload = async imgLink => {
  if (!imgLink) {
    return;
  }

  const imgUrClient = new ImgurClient({
    clientId: "435a6f19b61d480",
    clientSecret: "9c834f57bff301f92525022db60c256dbaa4f13f"
  });

  const uploadedFile = await imgUrClient.upload({
    image: imgLink,
    type: "stream",
  });
  
  return uploadedFile
};

module.exports.upload = upload;
