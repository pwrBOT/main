const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fetch = require("node-fetch");
const { RedirectHandler } = require("undici");
var startTime, endTime, duration;

module.exports = {
  name: "ldsadmin",
  category: "lds",
  description: "Lüdenscheid Mod - Admin Commands",
  data: new SlashCommandBuilder()
    .setName(`ldsadmin`)
    .setDescription(`Lüdenscheid Mod - Admin Commands`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`generatelocales`)
        .setDescription(`Locale-Generierung anstoßen`)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`generateaudio`)
        .setDescription(`Audio-Generierung anstoßen`)
    ),

  async execute(interaction, client) {
    return new Promise(async (resolve) => {
      const { member, channel, message } = interaction;

      if (
        member.id != "539513467313455105" &&
        member.id != "289759037573169162" &&
        member.id != "139139393746108417" &&
        member.id != "609057609953312789"
      ) {
        await interaction.reply(
          `❌ Nope! Du bist nicht berechtigt, diesen Befehl auszuführen!`
        );
        setTimeout(() => {
          interaction.deleteReply().catch((error) => {});
        }, 4000);
        return resolve(null);
      }

      if (channel.id != "963759674300178492") {
        const channel = await interaction.guild.channels.fetch(
          "963759674300178492"
        );
        await interaction.reply(
          `❌ Der Befehl kann nur im Channel ${channel} ausgeführt werden!`
        );
        setTimeout(() => {
          interaction.deleteReply().catch((error) => {});
        }, 4000);
        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "generatelocales") {
        const activeCheck = await fetch(
          "https://app.s-loer.de/api/v1/modules/jenkins/external/jobs/EM-Locales/branch/master/status?token=6IlQnelRwGa18jynvwRfZg=="
        )
          .then((res) => res.json())
          .then(async (res) => {
            if (res.data.running) {
              await interaction.reply("⚠️ Es läuft bereits eine Generierung!");
              setTimeout(() => {
                interaction.deleteReply().catch((error) => {});
              }, 4000);
              return resolve(null);
            } else {
              await interaction.reply("-");
              await interaction.deleteReply().catch((error) => {});
              const checkMessage = await channel.send(
                "Möchtest du die Generierung der Locals wirklich anstoßen?"
              );
              checkMessage.react("✅").then((r) => {
                checkMessage.react("❌");
              });

              const filter = (reaction, user) => {
                return (
                  ["✅", "❌"].includes(reaction.emoji.name) &&
                  user.id === interaction.user.id
                );
              };

              checkMessage
                .awaitReactions({
                  filter,
                  max: 1,
                  time: 10000,
                  errors: ["time"]
                })
                .then(async (collected) => {
                  const reaction = collected.first();

                  if (reaction.emoji.name === "✅") {
                    checkMessage.delete().catch((error) => {});
                    // ########################################################### \\
                    const response = await fetch(
                      "https://app.s-loer.de/api/v1/modules/jenkins/external/jobs/EM-Locales/branch/master/build?token=6IlQnelRwGa18jynvwRfZg=="
                    );

                    let msg = "";
                    if (response.status < 300) {
                      msg = await channel.send(
                        "⚠️ Die Generierung der Locals wurde angestoßen..."
                      );
                      start();
                    } else {
                      msg = await channel.send(
                        "❌ FEHLER | Die Generierung der Locals konnte nicht gestartet werden!"
                      );
                      setTimeout(() => {
                        msg.delete().catch((error) => {});
                      }, 4000);
                      return resolve(null);
                    }

                    const intervalId = setInterval(() => {
                      fetch(
                        "https://app.s-loer.de/api/v1/modules/jenkins/external/jobs/EM-Locales/branch/master/status?token=6IlQnelRwGa18jynvwRfZg=="
                      )
                        .then((res) => res.json())
                        .then((res) => {
                          if (res && !res.data.running) {
                            if (res.data.successful) {
                              msg.delete();
                              end();
                              channel.send(
                                `✅ Die Generierung der Locals wurde erfolgreich in ${duration} abgeschlossen!`
                              );
                            } else {
                              msg.delete();
                              channel.send(
                                "⚠️ FEHLER | Die Generierung der Locals war nicht erfolgreich!"
                              );
                            }
                            clearInterval(intervalId);
                          }
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }, 10000);
                    // ########################################################### \\
                  } else {
                    const msg = await channel.send(
                      "❌ Locals Generierung abgebrochen"
                    );
                    checkMessage.delete().catch((error) => {});
                    setTimeout(() => {
                      msg.delete().catch((error) => {});
                    }, 4000);
                  }
                })
                .catch(async (collected) => {
                  const msg = await channel.send(
                    "❌ Locals Generierung abgebrochen! Keine Reaktion innerhalb von 10 Sekunden ❌"
                  );
                  checkMessage.delete().catch((error) => {});
                  setTimeout(() => {
                    msg.delete().catch((error) => {});
                  }, 4000);
                });
            }
          });

        return resolve(null);
      }

      if (interaction.options.getSubcommand() === "generateaudio") {
        const activeCheck = await fetch(
          "https://app.s-loer.de/api/v1/modules/jenkins/external/jobs/EM-Audio/branch/master/status?token=6IlQnelRwGa18jynvwRfZg=="
        )
          .then((res) => res.json())
          .then(async (res) => {
            if (res.data.running) {
              await interaction.reply("⚠️ Es läuft bereits eine Generierung!");
              setTimeout(() => {
                interaction.deleteReply().catch((error) => {});
              }, 4000);
              return resolve(null);
            } else {
              await interaction.reply("-");
              await interaction.deleteReply().catch((error) => {});
              const checkMessage = await channel.send(
                "Möchtest du die Generierung der Sprachansagen wirklich anstoßen?"
              );
              checkMessage.react("✅").then((r) => {
                checkMessage.react("❌");
              });

              const filter = (reaction, user) => {
                return (
                  ["✅", "❌"].includes(reaction.emoji.name) &&
                  user.id === interaction.user.id
                );
              };

              checkMessage
                .awaitReactions({
                  filter,
                  max: 1,
                  time: 10000,
                  errors: ["time"]
                })
                .then(async (collected) => {
                  const reaction = collected.first();

                  if (reaction.emoji.name === "✅") {
                    checkMessage.delete().catch((error) => {});
                    // ########################################################### \\
                    const response = await fetch(
                      "https://app.s-loer.de/api/v1/modules/jenkins/external/jobs/EM-Audio/branch/master/build?token=6IlQnelRwGa18jynvwRfZg=="
                    );

                    let msg = "";

                    if (response.status < 300) {
                      msg = await channel.send(
                        "⚠️ Die Generierung der Sprachansagen wurde erfolgreich angestoßen..."
                      );
                      start();
                    } else {
                      msg = await channel.send(
                        "❌ FEHLER | Die Generierung der Sprachansagen konnte nicht gestartet werden!"
                      );
                      setTimeout(() => {
                        msg.delete().catch((error) => {});
                      }, 4000);
                      return resolve(null);
                    }

                    const intervalId = setInterval(() => {
                      fetch(
                        "https://app.s-loer.de/api/v1/modules/jenkins/external/jobs/EM-Audio/branch/master/status?token=6IlQnelRwGa18jynvwRfZg=="
                      )
                        .then((res) => res.json())
                        .then((res) => {
                          if (res && !res.data.running) {
                            if (res.data.successful) {
                              msg.delete();
                              end();
                              channel.send(
                                `✅ Die Generierung der Sprachansagen wurde erfolgreich in ${duration} abgeschlossen!`
                              );
                            } else {
                              msg.delete();
                              channel.send(
                                "⚠️ FEHLER | Die Generierung der Sprachansagen war nicht erfolgreich!"
                              );
                            }
                            clearInterval(intervalId);
                          }
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }, 10000);
                    // ########################################################### \\
                  } else {
                    const msg = await channel.send(
                      "❌ Sprachansagen Generierung Abgebrochen"
                    );
                    checkMessage.delete().catch((error) => {});
                    setTimeout(() => {
                      msg.delete().catch((error) => {});
                    }, 4000);
                  }
                })
                .catch(async (collected) => {
                  const msg = await channel.send(
                    "❌ Sprachansagen Generierung Abgebrochen! Keine Reaktion innerhalb von 10 Sekunden ❌"
                  );
                  checkMessage.delete().catch((error) => {});
                  setTimeout(() => {
                    msg.delete().catch((error) => {});
                  }, 4000);
                });
            }
          });
        return resolve(null);
      }

      function start() {
        startTime = performance.now();
      }

      function end() {
        endTime = performance.now();
        var timeDiff = endTime - startTime; //in ms
        // strip the ms
        timeDiff /= 1000;

        // get seconds
        var seconds = Math.round(timeDiff);
        duration = seconds + " Sekunden";
      }
    });
  }
};
