const { EmbedBuilder } = require("discord.js");
const tempRepository = require("../../mysql/tempRepository");
const guildSettingsRepository = require("../../mysql/guildSettingsRepository");
var client;

async function userTempMuteCheck() {
  const allTempUserToDelete = await tempRepository.getAllTempMuteUser();

  allTempUserToDelete.forEach((tempUserToDelete) => {
    userTempMuteUnmute(tempUserToDelete);
  });
}
async function userTempMuteUnmute(tempUserToDelete) {
  const guildId = tempUserToDelete.guildId;
  const unmuteGuild = await client.guilds.fetch(guildId);

  const memberId = tempUserToDelete.memberId;
  const unmuteMember = await unmuteGuild.members.cache.get(memberId);

  const guildSettings = await guildSettingsRepository.getGuildSettings(
    unmuteGuild,
    1
  );
  if (!guildSettings) {
    return resolve(null);
  }

  const muteRoleId = guildSettings.muteRole;
  const muteRole = unmuteGuild.roles.cache.get(muteRoleId);

  unmuteMember.roles.remove(muteRole).catch(console.error);

  console.log(
    `${unmuteMember.user.username}#${unmuteMember.user.discriminator}(${unmuteMember.id}) wurde bei ${unmuteGuild.name} automatisch entmuted!`
  );
  const unbanembed = new EmbedBuilder()
    .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
    .setDescription(
      `User: ${unmuteMember.user.username}#${unmuteMember.user.discriminator} wurde automatisch entmuted.\n\nMute-Grund: ${tempUserToDelete.warnReason}\nModerator: ${tempUserToDelete.warnModName}`
    )
    .setColor(0x51ff00)
    .setTimestamp(Date.now())
    .setThumbnail(unmuteMember.displayAvatarURL())
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `powered by Powerbot`,
    });

  const unbanembedmember = new EmbedBuilder()
    .setTitle(`⚡️ PowerBot | Moderation ⚡️`)
    .setDescription(
      `Dein Temp-Mute wurde automatisch entfernt!\n\nServer: "${unmuteGuild.name}"\n`
    )
    .setColor(0x51ff00)
    .setTimestamp(Date.now())
    .setThumbnail(unmuteGuild.iconURL())
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `powered by Powerbot`,
    });

  const modLogChannel = guildSettings.modLog;
  if (modLogChannel === undefined) {
    console.log(`Kein ModLog Channel bei ${unmuteGuild.name} vorhanden`);
  } else {
    client.channels.cache
      .get(modLogChannel)
      .send({ embeds: [unbanembed] })
      .catch(console.error);
  }
  unmuteMember.send({ embeds: [unbanembedmember] }).catch(console.error);

  await tempRepository.deleteTempUser(unmuteMember, unmuteGuild);
}

async function init(_client) {
  client = _client;
  setInterval(userTempMuteCheck, 30000);
}

module.exports.init = init;
