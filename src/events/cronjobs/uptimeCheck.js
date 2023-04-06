const { EmbedBuilder } = require("discord.js");
const monitoringRepository = require("../../mysql/monitoringRepository");
const schedule = require("node-schedule");
const fetch = require("node-fetch");

const init = async (client) => {
  schedule.scheduleJob("*/2 * * * *", async function () {
    await domainCheck(client);
  });

  // TEST
  schedule.scheduleJob("*/1 * * * *", async function () {});
};

const domainCheck = async (client) => {
  let domains = await monitoringRepository.getAll();
  let status = "-";
  let report = "-";

  domains.forEach(async (domain) => {
    const guild = await client.guilds.cache.get(domain.guildId);
    const monitoringChannel = await guild.channels.fetch(
      domain.monitoringChannelId
    );
    const pingRoleId = domain.pingRoleId;

    await fetch(domain.link).then(async (res) => {
      await monitoringRepository.lastCheck(domain.guildId, domain.link);

      // ONLINE
      if (res.status >= 200 && res.status <= 399) {
        if (domain.status == "DOWN" || domain.status == "-") {
          console.log(`${domain.name} --> UP (${res.status})`);
          status = "UP";
          report = `HTTP ${res.status} - OK`;

          await embed(
            domain,
            status,
            report,
            client,
            guild,
            monitoringChannel,
            pingRoleId
          );

          await monitoringRepository.update(
            domain.guildId,
            domain.link,
            status
          );
        }
      }

      // OFFLINE
      if (res.status >= 400 && res.status <= 599) {
        if (domain.status == "UP" || domain.status == "-") {
          console.log(`${domain.name} --> DOWN (${res.status})`);
          status = "DOWN";
          report = `HTTP ${res.status} - DOWN`;

          await embed(
            domain,
            status,
            report,
            client,
            guild,
            monitoringChannel,
            pingRoleId
          );

          await monitoringRepository.update(
            domain.guildId,
            domain.link,
            status
          );
        }
      }
    });
  });
};

const embed = async (
  domain,
  status,
  report,
  client,
  guild,
  monitoringChannel,
  pingRoleId
) => {
  let color = "";
  let content = "";

  console.log(domain, status);

  if (status == "UP") {
    color = 0x09ff00;
    content = "\u200B";
  } else {
    color = 0xfc031c;
    content = "\u200B";
  }

  const monitoringEmbed = new EmbedBuilder()
    .setTitle(`⚡️ Monitoring ⚡️`)
    .setDescription(`Host: ${domain.name}`)
    .setColor(color)
    .setTimestamp(Date.now())
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `powered by Powerbot`
    })
    .addFields([
      {
        name: `Status:`,
        value: `${status}`,
        inline: true
      },
      {
        name: `Report:`,
        value: `${report}`,
        inline: true
      }
    ]);

  monitoringChannel.send({ embeds: [monitoringEmbed] }).catch((error) => {});
};

module.exports.init = init;
