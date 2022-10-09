const { EmbedBuilder } = require("discord.js");
const tempCommandRepository = require("../../mysql/tempCommandRepository");
var client;

async function userTempBanCheck() {
  const allTempUserToDelete = await tempCommandRepository.getAllTempBanUser();

  if (!allTempUserToDelete) {
    return;
  }

  allTempUserToDelete.forEach((tempUserToDelete) => {
    userTempBanUnban(tempUserToDelete);
  });
}
async function userTempBanUnban(tempUserToDelete) {
  const guildId = tempUserToDelete.guildId;
  const unbanGuild = await client.guilds.fetch(guildId);

  const memberId = tempUserToDelete.memberId;
  const unbanMember = await client.users.fetch(memberId);

  unbanGuild.members.unban(unbanMember).catch(console.error);
  console.log(
    `${unbanMember.tag}(${unbanMember.id}) wurde bei ${unbanGuild.name} automatisch entbannt!`
  );
  const unbanembed = new EmbedBuilder()
    .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
    .setDescription(
      `User: ${unbanMember.tag} wurde automatisch entbannt.\n\nBan-Grund: ${tempUserToDelete.warnReason}\nModerator: ${tempUserToDelete.warnModName}`
    )
    .setColor(0x51ff00)
    .setTimestamp(Date.now())
    .setThumbnail(unbanMember.displayAvatarURL())
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `powered by Powerbot`,
    });

  const unbanembedmember = new EmbedBuilder()
    .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
    .setDescription(
      `Dein Tempban wurde automatisch entfernt!\n\nServer: "${unbanGuild.name}"\n`
    )
    .setColor(0x51ff00)
    .setTimestamp(Date.now())
    .setThumbnail(unbanGuild.iconURL())
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `powered by Powerbot`,
    });

  const logChannel = require("../../mysql/loggingChannelsRepository");
  await logChannel.logChannel(unbanGuild, "modLog", unbanembed);
  try {
    await unbanMember.send({ embeds: [unbanembedmember] });
  } catch (error) {}

  await tempCommandRepository.deleteTempUser(unbanMember, unbanGuild);
}

async function init(_client) {
  client = _client;
  setInterval(userTempBanCheck, 60000);
}

module.exports.init = init;
