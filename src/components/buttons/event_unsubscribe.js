const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder
} = require("discord.js");
const eventRepository = require("../../mysql/eventRepository");
const waitMap = require("../../functions/eventSystem/waitMap");

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

const buttonSubscribe = new ButtonBuilder()
  .setCustomId("event_subscribe")
  .setLabel(`✅`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(false);

const buttonTentative = new ButtonBuilder()
  .setCustomId("event_tentative")
  .setLabel(`❔`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(false);

const buttonUnsubscribe = new ButtonBuilder()
  .setCustomId("event_unsubscribe")
  .setLabel(`❌`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(false);

const buttonDelete = new ButtonBuilder()
  .setCustomId("event_delete")
  .setLabel(`🗑`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(false);

module.exports = {
  data: {
    name: `event_unsubscribe`
  },
  async execute(interaction) {
    return new Promise(async resolve => {
      const { guild, member, message } = interaction;

      // ########################## WAIT MAP CHECK ########################## \\
      const waitMapCheck = await waitMap.init(member, interaction);

      if (waitMapCheck == "stop") {
        interaction.reply({
          content: `Ey... Ändere nicht so schnell deine Meinung ;) Du kannst deine Auswahl nur alle 2 Sekunden ändern.`,
          ephemeral: true
        });
        return resolve(null);
      } else {
        interaction.deferUpdate().then().catch();
      }

      const embed = await message.embeds[0];
      const eventId = await embed.footer.text.split("#")[1];

      // ########################## GET DB-DATA ########################## \\
      const allParticipants = await eventRepository.getAllParticipants(eventId);

      const teilnehmer = allParticipants.filter(function(paricitpants) {
        return paricitpants.status == "subscribe";
      });

      const interessenten = allParticipants.filter(function(paricitpants) {
        return paricitpants.status == "tentative";
      });

      const abgesagt = allParticipants.filter(function(paricitpants) {
        return paricitpants.status == "unsubscribe";
      });

      // ########################## ABGESAGT ########################## \\
      let abgesagtListe = [];
      let abgesagtSize = "";

      // HOLE ALLE TEILNEHMER AUS DB
      await abgesagt.forEach(async abgesagt => {
        abgesagtListe.push(abgesagt.memberName);
      });

      if (abgesagt) {
        abgesagtSize = "";
      } else {
        abgesagtSize = "0";
        abgesagtListe = ["> \u200B"];
      }

      // CHECK OB PERSON BEREITS EINGETRAGEN IST. WENN JA: AUSTRAGEN! WENN NEIN: EINTRAGEN!
      if (abgesagtListe.includes(member.user.username)) {
        abgesagtListe = abgesagtListe.filter(function(delName) {
          return delName != member.user.username;
        });

        if (abgesagtListe.length == 0) {
          abgesagtListe = ["> \u200B"];
          abgesagtSize = "0";
        } else {
          abgesagtSize = abgesagtListe.length;
        }

        await eventRepository.delParticipant(eventId, member.id);
      } else {
        await eventRepository.delParticipant(eventId, member.id);
        await eventRepository.addParticipant(
          eventId,
          guild.id,
          member.id,
          member.user.username,
          "unsubscribe"
        );
        abgesagtListe.push(member.user.username);
        abgesagtSize = abgesagtListe.length;
      }

      // ########################## INTERESSENTEN ########################## \\
      let interessentenListe = [];
      let interessentenSize = "";

      await interessenten.forEach(async interessenten => {
        interessentenListe.push(interessenten.memberName);
      });

      interessentenListe = interessentenListe.filter(function(delName) {
        return delName != member.user.username;
      });

      if (interessentenListe.length != 0) {
        interessentenSize = interessentenListe.length;
      } else {
        interessentenSize = "0";
        interessentenListe = ["> \u200B"];
      }

      // ########################## TEILNEHMER ########################## \\
      let teilnehmerListe = [];
      let teilnehmerSize = "";

      // HOLE ALLE TEILNEHMER AUS DB
      await teilnehmer.forEach(async teilnehmer => {
        teilnehmerListe.push(teilnehmer.memberName);
      });

      teilnehmerListe = teilnehmerListe.filter(function(delName) {
        return delName != member.user.username;
      });

      if (teilnehmerListe.length != 0) {
        teilnehmerSize = teilnehmerListe.length;
      } else {
        teilnehmerSize = "0";
        teilnehmerListe = ["> \u200B"];
      }

      const teilnehmerNames = teilnehmerListe.join(", ");
      const interessentenNames = interessentenListe.join(", ");
      const abgesagtNames = abgesagtListe.join(", ");

      const newEmbed = new EmbedBuilder()
        .setTitle(embed.title)
        .setDescription(embed.description)
        .setColor(embed.color)
        .setFooter(embed.footer)
        .addFields(
          {
            name: `✅ Zugesagt (${teilnehmerSize}):`,
            value: teilnehmerNames,
            inline: true
          },
          {
            name: `❔ Interessiert (${interessentenSize}):`,
            value: interessentenNames,
            inline: true
          },
          {
            name: `❌ Abgesagt (${abgesagtSize}):`,
            value: abgesagtNames,
            inline: true
          }
        );

      if (embed.image) {
        newEmbed.setImage(embed.image.url);
      }

      const eventPosting = await message.edit({
        embeds: [newEmbed]
      });

      return resolve(null);
    });
  }
};