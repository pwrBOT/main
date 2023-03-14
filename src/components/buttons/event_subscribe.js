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
    name: `event_subscribe`
  },
  async execute(interaction) {
    return new Promise(async resolve => {
      const { guild, member, message } = interaction;

      // ########################## WAIT MAP CHECK ########################## \\
      const waitMapCheck = await waitMap.init(member, interaction);

      if (waitMapCheck == "stop") {
        await interaction.reply({
          content: `Ey... Ändere nicht so schnell deine Meinung ;) Du kannst deine Auswahl nur alle 2 Sekunden ändern.`,
          ephemeral: true
        });
        return resolve(null);
      }

      const embed = await message.embeds[0];
      const eventId = await embed.footer.text.split("#")[1];
      const event = await eventRepository.eventGet(eventId)

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

      // ########################## TEILNEHMER ########################## \\
      let teilnehmerListe = [];
      let teilnehmerSize = "";

      // HOLE ALLE TEILNEHMER AUS DB
      await teilnehmer.forEach(async teilnehmer => {
        teilnehmerListe.push(teilnehmer.memberName);
      });

      if (teilnehmer) {
        teilnehmerSize = "";
      } else {
        teilnehmerSize = "0";
        teilnehmerListe = ["> \u200B"];
      }

      // CHECK OB PERSON BEREITS EINGETRAGEN IST. WENN JA: AUSTRAGEN! WENN NEIN: EINTRAGEN!
      if (teilnehmerListe.includes(member.user.username)) {
        teilnehmerListe = teilnehmerListe.filter(function(delName) {
          return delName != member.user.username;
        });

        if (teilnehmerListe.length == 0) {
          teilnehmerListe = ["> \u200B"];
          teilnehmerSize = "0";
        } else {
          teilnehmerSize = teilnehmerListe.length;
        }

        await eventRepository.delParticipant(eventId, member.id);
      } else {

        if (teilnehmerListe.length == event.maxSubscribers){
          await interaction.reply({
            content: `Die maximale Teilnehmeranzahl wurde schon erreicht.`,
            ephemeral: true
          });
          return resolve(null);
        }

        interaction.deferUpdate().then().catch();

        await eventRepository.delParticipant(eventId, member.id);
        await eventRepository.addParticipant(
          eventId,
          guild.id,
          member.id,
          member.user.username,
          "subscribe"
        );
        teilnehmerListe.push(member.user.username);
        teilnehmerSize = teilnehmerListe.length;
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

      // ########################## ABGESAGT ########################## \\
      let abgesagtListe = [];
      let abgesagtSize = "";

      // HOLE ALLE TEILNEHMER AUS DB
      await abgesagt.forEach(async abgesagt => {
        abgesagtListe.push(abgesagt.memberName);
      });

      abgesagtListe = abgesagtListe.filter(function(delName) {
        return delName != member.user.username;
      });

      if (abgesagtListe.length != 0) {
        abgesagtSize = abgesagtListe.length;
      } else {
        abgesagtSize = "0";
        abgesagtListe = ["> \u200B"];
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

      message.edit({
        components: [
          new ActionRowBuilder().addComponents([
            buttonSubscribe,
            buttonTentative,
            buttonUnsubscribe,
            buttonDelete
          ])
        ]
      });
      return resolve(null);
    });
  }
};
