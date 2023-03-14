const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const schedule = require("node-schedule");
const eventRepository = require("../../mysql/eventRepository");

// BUTTONS
const buttonSubscribeHidden = new ButtonBuilder()
  .setCustomId("event_subscribe")
  .setLabel(`✅`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(true);

const buttonTentativeHidden = new ButtonBuilder()
  .setCustomId("event_tentative")
  .setLabel(`❔`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(true);

const buttonUnsubscribeHidden = new ButtonBuilder()
  .setCustomId("event_unsubscribe")
  .setLabel(`❌`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(true);

const buttonReactivate = new ButtonBuilder()
  .setCustomId("event_reactivate")
  .setLabel(`🔄`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(false);

const init = async client => {
  schedule.scheduleJob("15 * * * *", async function() {
    await eventEndCheck(client);
    await eventReminder(client);
    await eventReminderNow(client);
    await eventMessageDeleteCheck(client);
  });

  schedule.scheduleJob("30 * * * *", async function() {
    await eventEndCheck(client);
    await eventReminder(client);
    await eventReminderNow(client);
    await eventMessageDeleteCheck(client);
  });

  schedule.scheduleJob("45 * * * *", async function() {
    await eventEndCheck(client);
    await eventReminder(client);
    await eventReminderNow(client);
    await eventMessageDeleteCheck(client);
  });

  schedule.scheduleJob("00 * * * *", async function() {
    await eventEndCheck(client);
    await eventReminder(client);
    await eventReminderNow(client);
    await eventMessageDeleteCheck(client);
  });

  // TEST SHEDULE
  schedule.scheduleJob("*/1 * * * *", async function() {});
};

const eventEndCheck = async client => {
  const allEvents = await eventRepository.getAllEvents();

  if (allEvents) {
    allEvents.forEach(async event => {
      if (event.eventEnd < new Date(Date.now() + 3600000)) {
        const channel = await client.channels.fetch(event.channelId).catch(error => {});
        const message = await channel.messages.fetch(event.messageId).catch(error => {});
        const embed = await message.embeds[0];
        const eventId = await embed.footer.text.split("#")[1];

        const newEmbed = new EmbedBuilder()
          .setTitle(`${embed.title} [Event beendet]`)
          .setDescription(embed.description)
          .setColor(embed.color)
          .setFooter(embed.footer)
          .addFields(embed.fields);

        if (embed.image) {
          newEmbed.setImage(embed.image.url);
        }

        await message.edit({
          embeds: [newEmbed],
          components: [
            new ActionRowBuilder().addComponents([
              buttonSubscribeHidden,
              buttonTentativeHidden,
              buttonUnsubscribeHidden,
              buttonReactivate
            ])
          ]
        });

        await eventRepository.eventUpdate(eventId, "eventStatus", "ended");
      }
    });
  }
};

const eventReminder = async client => {
  const allEvents = await eventRepository.getAllEvents();
  const dateNow = new Date(Date.now() + 3600000).getTime();

  allEvents.forEach(async event => {
    const remindDate = event.eventStart - 3600000;

    if (event.eventReminder === 0) {
      if (remindDate <= dateNow) {
        await eventRepository.eventUpdate(event.eventId, "eventReminder", 1);

        const channel = await client.channels.fetch(event.channelId).catch(error => {});
        const message = await channel.messages.fetch(event.messageId).catch(error => {});

        if (!message) {
          return;
        }

        const embed = await message.embeds[0];

        const newEmbed = new EmbedBuilder()
          .setTitle(`${embed.title}`)
          .setDescription(
            `${event.eventDescription}\n\n**Zeit:**\n<t:${Date.parse(
              event.eventStart
            ) /
              1000 -
              3600}:F> - <t:${Date.parse(event.eventEnd) / 1000 -
              3600}:F>\n\n[➡️  Zum Event](${message.url})`
          )
          .setColor(embed.color)
          .setFooter(embed.footer);

        if (embed.image) {
          newEmbed.setImage(embed.image.url);
        }

        const allParticipants = await eventRepository.getAllParticipants(
          event.eventId
        );

        const teilnehmer = await allParticipants.filter(function(paricitpants) {
          return paricitpants.status == "subscribe";
        });

        await teilnehmer.forEach(async teilnehmer => {
          const member = await client.users.fetch(teilnehmer.memberId);

          try {
            await member
              .send({
                content: `**📅 EVENT REMINDER**\n\nEin Event, zu dem du dich eingetragen hast, beginnt ⏱<t:${Date.parse(
                  event.eventStart
                ) /
                  1000 -
                  3600}:R>\n`,
                embeds: [newEmbed]
              })
              .catch(error => {});
          } catch (error) {}
        });

        const tentative = await allParticipants.filter(function(paricitpants) {
          return paricitpants.status == "tentative";
        });

        await tentative.forEach(async tentative => {
          const member = await client.users.fetch(tentative.memberId);

          try {
            await member
              .send({
                content: `**📅  EVENT REMINDER**\n\nEin Event, für das du dich interessierst, beginnt in Kürze:`,
                embeds: [newEmbed]
              })
              .catch(error => {});
          } catch (error) {}
        });
      }
    }
  });
};

const eventReminderNow = async client => {
  const allEvents = await eventRepository.getAllEvents();
  const dateNow = new Date(Date.now() + 3600000).getTime();

  allEvents.forEach(async event => {
    const remindDate = event.eventStart - 900000;

    if (event.eventReminder === 1) {
      if (remindDate <= dateNow) {
        await eventRepository.eventUpdate(event.eventId, "eventReminder", 2);

        const channel = await client.channels.fetch(event.channelId).catch(error => {});
        const message = await channel.messages.fetch(event.messageId).catch(error => {});

        if (!message) {
          return;
        }

        const embed = await message.embeds[0];

        const newEmbed = new EmbedBuilder()
          .setTitle(`${embed.title}`)
          .setDescription(
            `${event.eventDescription}\n\n**Zeit:**\n<t:${Date.parse(
              event.eventStart
            ) /
              1000 -
              3600}:F> - <t:${Date.parse(event.eventEnd) / 1000 -
              3600}:F>\n\n[➡️  Zum Event](${message.url})`
          )
          .setColor(embed.color)
          .setFooter(embed.footer);

        if (embed.image) {
          newEmbed.setImage(embed.image.url);
        }

        const allParticipants = await eventRepository.getAllParticipants(
          event.eventId
        );

        const teilnehmer = await allParticipants.filter(function(paricitpants) {
          return paricitpants.status == "subscribe";
        });

        await teilnehmer.forEach(async teilnehmer => {
          const member = await client.users.fetch(teilnehmer.memberId);

          try {
            await member
              .send({
                content: `**📅 EVENT REMINDER**\n\nEin Event, zu dem du dich eingetragen hast, beginnt gleich.`,
                embeds: [newEmbed]
              })
              .catch(error => {});
          } catch (error) {}
        });

        const tentative = await allParticipants.filter(function(paricitpants) {
          return paricitpants.status == "tentative";
        });

        await tentative.forEach(async tentative => {
          const member = await client.users.fetch(tentative.memberId);

          try {
            await member
              .send({
                content: `**📅  EVENT REMINDER**\n\nEin Event, für das du dich interessierst, beginnt gleich:`,
                embeds: [newEmbed]
              })
              .catch(error => {});
          } catch (error) {}
        });
      }
    }
  });
};

const eventMessageDeleteCheck = async client => {
  const allEvents = await eventRepository.getAllEvents();

  allEvents.forEach(async event => {
    const channel = await client.channels.fetch(event.channelId).catch(error => {});
    let message = "";

    try {
      message = await channel.messages.fetch(event.messageId);
    } catch (error) {}

    if (!message) {
      await eventRepository.eventUpdate(
        event.eventId,
        "eventStatus",
        "removed"
      );
    } else {
    }
  });
};

module.exports.init = init;
