const { EmbedBuilder } = require("discord.js");
const monitoringRepository = require("../../mysql/monitoringRepository");

const schedule = require("node-schedule");
const fetch = require("node-fetch");

const init = async (client) => {
  schedule.scheduleJob("*/5 * * * *", async function () {
    await domainCheck(client);
  });

  // TEST
  schedule.scheduleJob("*/1 * * * *", async function () {});
};

const domainCheck = async (client) => {
  let domains = await monitoringRepository.get();

  let status = "";
  let report = "";

  domains.forEach(async (domain) => {

    const guild = await client.guilds.cache.get(domain.guildId);
    const monitoringChannel = await guild.channels.fetch(
      domain.monitoringChannelId
    );
    const pingRole = await guild.roles.fetch(domain.pingRoleId);

    await fetch(domain.link)
      .then(async (res) => {
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
              pingRole
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
              pingRole
            );

            await monitoringRepository.update(
              domain.guildId,
              domain.link,
              status
            );
          }
        }
      })
      .catch(async (error) => {
        if (monitoringDownMap.has(domain.name)) {
        } else {
          console.log(`${domain.name} --> DOWN`);
          status = "DOWN";
          report = `HTTP - DOWN`;

          monitoringDownMap.set(domain.name, "offline");
          monitoringUpMap.delete(domain.name);
          await embed(
            domain,
            status,
            report,
            client,
            guild,
            monitoringChannel,
            pingRole
          );
          console.log(error);
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
  pingRole
) => {
  let color = "";
  let content = "";

  if ((domain.status = "ONLINE")) {
    color = "0x03f8fc";
    content = "\u200B";
  } else {
    color = "0xfc031c";
    content = `${pingRole}`;
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

  monitoringChannel.send({content: content, embeds:[monitoringEmbed]}).catch(error =>{})
};

module.exports.init = init;
