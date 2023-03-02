const { Client, ChannelType } = require("discord.js");
const SoftUI = require("dbd-soft-ui");
const DBD = require("discord-dashboard");
const config = require(`../../../config.json`);
const levelsRepository = require("../../mysql/levelsRepository");
const embedsRepository = require("../../mysql/embedsRepository");
const autoModRepository = require("../../mysql/autoModRepository");
const guildsRepository = require("../../mysql/guildsRepository");
const powerbotManagement = require("../../mysql/powerbotManagement");
const os = require("os");
let values = [0, null, null, null, null, null, null, null, null, null];

setInterval(function() {
  values.unshift(
    ((os.totalmem() - os.freemem()) / (1000 * 1000 * 1000)).toFixed(2) * 100
  );
  values.pop();
}, 60 * 1000);

const init = async client => {
  let info = [];
  let moderation = [];
  let warning = [];
  let admintools = [];

  const { user } = client;
  const information = client.commands.filter(x => x.category === "info");
  const mod = client.commands.filter(x => x.category === "moderation");
  const warnsystem = client.commands.filter(x => x.category === "warning");
  const admin = client.commands.filter(x => x.category === "admintools");

  CommandPush(information, info);
  CommandPush(mod, moderation);
  CommandPush(warnsystem, warning);
  CommandPush(admin, admintools);

  await DBD.useLicense(config.dbd.license);
  DBD.Dashboard = DBD.UpdatedClass();

  const Dashboard = new DBD.Dashboard({
    port: config.dbd.port,
    client: config.discord.client,
    redirectUri: `${config.dbd.domain}${config.dbd.redirectUri}`,
    domain: config.dbd.domain,
    ownerIDs: config.dbd.ownerIDs,
    useThemeMaintenance: false,
    underMaintenance: {
      title: "Under Maintenance",
      contentTitle: "This page is under maintenance",
      texts: [
        "We still want to change for the better for you.",
        "Therefore, we are introducing technical updates so that we can allow you to enjoy the quality of our services.",
        "Come back to us later or join our Discord Support Server"
      ],

      // "Must contain 3 cards. All fields are optional - If card not wanted on maintenance page, infoCards can be deleted",
      infoCards: [
        {
          title: "100+",
          subtitle: "Over 100 commands!",
          description: "Look at our commands during our downtime"
        },
        {
          title: "500",
          subtitle: "Text",
          description: "Description here!"
        },
        {
          title: "!",
          subtitle: "Warning",
          description: "Do you even have permission to be here?"
        }
      ]
    },
    useTheme404: true,
    bot: client,
    requiredPermissions: [DBD.DISCORD_FLAGS.Permissions.ADMINISTRATOR],
    supportServer: {
      slash: "/support",
      inviteUrl: "https://discord.gg/QfDNMCxzsN"
    },
    acceptPrivacyPolicy: true,
    minimizedConsoleLogs: true,
    bot: client,
    theme: SoftUI({
      locales: {
        deDE: {
          name: "Deutsch",
          index: {
            feeds: ["DIE ULTIMATIVE POWER NUTZEN:"],
            card: {
              category: "Welcome to PowerBot",
              title:
                "PowerBot - Hol dir die ultimative Power für deinen Discord Server",
              description: `Wir befinden uns derzeit noch in der Entwicklung, weshalb der Bot nicht allgemein Verfügbar ist.\n\nDu möchtest den Bot testen? Melde dich bei uns!`,
              image: "https://pwr.lol/img/bot_logo_wide.png",
              link: {
                text: ">>> ZUM POWER BOT DISCORD SERVER",
                enabled: true,
                url: "https://discord.pwr.lol"
              }
            },
            feedsTitle: "Feeds",
            graphTitle: "RAM-Auslastung"
          },
          manage: {
            settings: {
              memberCount: "Members",
              info: {
                info: "Info",
                server: "Server Information"
              }
            }
          },
          privacyPolicy: {
            title: "Privacy Policy",
            description: "Privacy Policy and Terms of Service",
            pp: "Complete Privacy Policy"
          },
          partials: {
            sidebar: {
              dash: "Dashboard",
              manage: "Discord Server verwalten",
              commands: "Bot Commands",
              pp: "Privacy Policy",
              admin: "Admin",
              account: "Account Pages",
              login: "Einloggen",
              logout: "Ausloggen"
            },
            navbar: {
              home: "Home",
              pages: {
                manage: "Discord Server verwalten",
                settings: "Discord Server verwalten",
                commands: "Commands",
                pp: "Privacy Policy",
                error: "Error",
                credits: "Credits",
                debug: "Debug",
                leaderboard: "Leaderboard",
                profile: "Profil",
                maintenance: "Under Maintenance"
              }
            },
            title: {
              pages: {
                manage: "Discord Server verwalten",
                settings: "Discord Server verwalten",
                commands: "Commands",
                pp: "Privacy Policy",
                admin: "Admin Panel",
                error: "Error",
                credits: "Credits",
                debug: "Debug",
                leaderboard: "Leaderboard",
                profile: "Profil",
                maintenance: "Under Maintenance"
              }
            },
            preloader: {
              image: "https://pwr.lol/img/bot_logo_wide.png",
              spinner: true,
              text: "Power wird geladen..."
            },
            /** 
            premium: {
              title: "Du möchtest Premium-Power?",
              description:
                "Schau dir unsere Angebote an und hol dir die ultimative Power.",
              buttonText: "Premium holen"
            },*/
            settings: {
              title: "Einstellungen",
              description: "Ansichtsoptionen",
              theme: {
                title: "Theme",
                description: "Wie darf es sein?"
              },
              language: {
                title: "Sprache",
                description: "Wähl Deine bevorzugte Sprache aus!"
              }
            }
          }
        }
      },
      customThemeOptions: {
        index: async ({ req, res, config }) => {
          const cards = [
            {
              title: "Server",
              icon: "spaceship",
              getValue: `${client.guilds.cache.size} Server`,
              progressBar: {
                enabled: false,
                getProgress: 8 // 0 - 100 (get a percentage of the progress)
              }
            }
          ];

          const graph = {
            values,
            labels: [
              "1m",
              "2m",
              "3m",
              "4m",
              "5m",
              "6m",
              "7m",
              "8m",
              "9m",
              "10m"
            ]
          };
          return {
            cards,
            graph
          };
        }
      },
      websiteName: "PowerBot",
      colorScheme: "yellow",
      supporteMail: "power@pwr.lol",
      /** 
      premium: {
        enabled: false,
        card: {
          title: "Du möchtest Premium-Power?",
          description:
            "Schau dir unsere Angebote an und hol dir die ultimative Power.",
          bgImage:
            "https://assistantscenter.com/wp-content/uploads/2021/11/cropped-cropped-logov6.png",
          button: {
            text: "Premium holen",
            url: "https://pwr.lol"
          }
        }
      },*/
      icons: {
        favicon: "https://pwr.lol/img/bot_logo_discord.png",
        noGuildIcon: "https://pwr.lol/img/bot_logo_discord.png",
        sidebar: {
          darkUrl: "https://pwr.lol/img/bot_logo_wide.png",
          lightUrl: "https://pwr.lol/img/bot_logo_wide.png",
          hideName: true,
          borderRadius: false,
          alignCenter: true
        },
        settings: {}
      },
      preloader: {
        image: "https://pwr.lol/img/bot_logo_wide.png",
        spinner: true,
        text: "Power wird geladen..."
      },
      admin: {
        pterodactyl: {
          enabled: false,
          apiKey: "apiKey",
          panelLink: "http://localhost:3000/",
          serverUUIDs: []
        },
        logs: {
          enabled: true,
          key: "34geJ6!aaASD12908!"
        }
      },
      index: {
        card: {
          category: "Dashboard",
          title:
            "PowerBot - Hol dir die ultimative Power für deinen Discord Server",
          description: "",
          image: "https://pwr.lol/img/bot_logo_wide.png",
          link: {
            text: "Support Server",
            enabled: true,
            url: "https://discord.gg/yYq4UgRRzz"
          }
        },
        graph: {
          enabled: true,
          lineGraph: false,
          title: "Memory Usage",
          tag: "Memory (MB)",
          max: 100
        }
      },
      sweetalert: {
        errors: {},
        success: {
          login: "Erfolgreich eingeloggt =)"
        }
      },
      shardspage: {
        enabled: true,
        interval: 10,
        key: "3S!Dsd2908!4geJ6!aaA",
        backgroundUrl:
          "https://t3.ftcdn.net/jpg/03/44/67/38/360_F_344673825_6fU6IORyipkYpfU1mg2vmxtHxDToUO6Q.jpg"
      },
      /// ################## COMMANDS ################## \\\
      commands: [
        {
          category: `Admin Tools`,
          subTitle: `Commands für Admins`,
          aliasesDisabled: true,
          list: admintools
        },
        {
          category: `Moderation`,
          subTitle: `Commands zur Moderation von Usern`,
          aliasesDisabled: true,
          list: moderation
        },
        {
          category: `Warn-System`,
          subTitle: `Zur Moderation von Usern`,
          aliasesDisabled: true,
          list: warning
        },
        {
          category: `Allgemeines`,
          subTitle: `Allgemeine Commands`,
          aliasesDisabled: true,
          list: info
        }
      ]
    }),
    settings: [
      /// ################## BOT SETTINGS ################## \\\
      {
        categoryId: "adminsettings",
        categoryName: "Generelle Einstellungen",
        categoryDescription:
          "Definiere wichtige Rollen und Channel für das Team, Moderatoren, Logging, ...",
        categoryImageURL:
          "https://pwr.lol/img/icons/screwdriver-wrench-solid.svg",
        refreshOnSave: true,
        categoryOptionsList: [
          /// ########## ROLE SETTINGS ########## \\\
          {
            optionId: "botMaster",
            optionName: "",
            optionDescription: "Bot Master Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "botMaster"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "botMaster"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "botMaster";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "botMaster";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "teamRole",
            optionName: "",
            optionDescription: "Team Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "teamRole"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "teamRole"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "teamRole";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "teamRole";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "modRole",
            optionName: "",
            optionDescription: "Moderator Rollen:",
            optionType: DBD.formTypes.rolesMultiSelect(false, false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "modRole"
              );

              if (data) return JSON.parse(data.value);
              else return [];
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "modRole"
              );

              if (!data) {
                const property = "modRole";
                newDataString = JSON.stringify(newData);
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              } else {
                const property = "modRole";
                newDataString = JSON.stringify(newData);
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              }
              return;
            }
          },
          /// ########## CHANNEL SETTINGS ########## \\\
          {
            optionId: "modArea",
            optionName: "",
            optionDescription:
              "Mod-Area (Hier werden Threads für Reports erstellt. Freilassen, wenn man keine Threads aktivieren möchte):",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "modArea"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "modArea"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "modArea";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "modArea";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "modLog",
            optionName: "",
            optionDescription: "Mod-Log Channel:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "modLog"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "modLog"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "modLog";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "modLog";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "botlog",
            optionName: "",
            optionDescription: "Bot-Log Channel:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "botlog"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "botlog"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "botlog";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "botlog";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "ignoredChannels",
            optionName: "",
            optionDescription:
              "Channels die vom Logging ausgenommen sind (z.B. Admin Channels):",
            optionType: DBD.formTypes.channelsMultiSelect(
              false,
              true,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "ignoredChannels"
              );

              if (data) return JSON.parse(data.value);
              else return [];
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "ignoredChannels"
              );

              if (!data) {
                const property = "ignoredChannels";
                newDataString = JSON.stringify(newData);
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              } else {
                const property = "ignoredChannels";
                newDataString = JSON.stringify(newData);
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              }
              return;
            }
          },
          {
            optionId: "donatorRole",
            optionName: "",
            optionDescription: "Donator Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "donatorRole"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "donatorRole"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "donatorRole";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "donatorRole";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          /// ####### Channel ####### \\\
          {
            optionId: "afkchannel",
            optionName: "",
            optionDescription: "AFK-Channel:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildVoice])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "afkchannel"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "afkchannel"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "afkchannel";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "afkchannel";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "achievementChannel",
            optionName: "",
            optionDescription: "Achievement Channel:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "achievementChannel"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "achievementChannel"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "achievementChannel";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "achievementChannel";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          /// ####### TEXTE ####### \\\
          {
            optionId: "embedinfo",
            optionName: "",
            optionDescription:
              "Moderations Info-Text für User (z.B.: Bei Fragen wende dich an... / Server-Rejoin Link... / ...). Wird beim User Embed dran gehängt:",
            optionType: DBD.formTypes.textarea(
              "Bei Fragen wende dich an die Communityleitung!",
              1,
              200,
              false,
              false
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "embedinfo"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "embedinfo"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "embedinfo";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "embedinfo";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "language",
            optionName: "",
            optionDescription: "Bot Sprache:",
            optionType: DBD.formTypes.select(
              { " ": " ", Deutsch: "de", English: "en" },
              false
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "language"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "language"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "language";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "language";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          }
        ]
      },
      /// ################ BOT SETTINGS END ################ \\\
      /// ################## AUTO MESSAGES ################## \\\
      {
        categoryId: "automessages",
        categoryName: "Welcome Message",
        categoryImageURL: "https://pwr.lol/img/icons/handshake-regular.svg",
        categoryDescription: "### SOON ### - Funktion nur teilweise verfügbar",

        refreshOnSave: true,
        toggleable: true,
        getActualSet: async ({ guild }) => {
          let data = await guildsRepository.getGuildSetting(
            guild,
            "welcomeMessageStatus"
          );
          if (data) {
            if (data.value === "1") return true;
          } else return false;
        },
        setNew: async ({ guild, newData }) => {
          let data = await guildsRepository.getGuildSetting(
            guild,
            "welcomeMessageStatus"
          );

          if (!newData) newData = null;

          if (!data) {
            const property = "welcomeMessageStatus";
            await guildsRepository.insertGuildSetting(guild, property, newData);
          } else {
            const property = "welcomeMessageStatus";
            await guildsRepository.updateGuildSetting(guild, property, newData);
          }
          return;
        },
        categoryOptionsList: [
          {
            optionId: "welcomechannel",
            optionName: "",
            optionDescription: "Welcome Channel:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "welcomechannel"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "welcomechannel"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "welcomechannel";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "welcomechannel";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "communityrole",
            optionName: "",
            optionDescription:
              "Community Rollen (Werden automatisch vergeben, wenn ein User auf den Server joined):",
            optionType: DBD.formTypes.rolesMultiSelect(false, false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "communityrole"
              );

              if (data) return JSON.parse(data.value);
              else return [];
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "communityrole"
              );

              if (!data) {
                const property = "communityrole";
                newDataString = JSON.stringify(newData);
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              } else {
                const property = "communityrole";
                newDataString = JSON.stringify(newData);
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              }
              return;
            }
          },
          {
            optionId: "welcomeChannelMessage",
            optionName: "",
            optionDescription:
              "Text, der im Welcome Channel, über dem Welcome Banner, gepostet wird, wenn ein User joined. (Tags: Username: {member} / Servername: {servername})",
            optionType: DBD.formTypes.textarea(
              "Hey {member} 😎 | Herzlich Willkommen bei **{servername}**!",
              1,
              200,
              false,
              false
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "welcomeChannelMessage"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "welcomeChannelMessage"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "welcomeChannelMessage";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "welcomeChannelMessage";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "welcomeBannerPictureLink",
            optionName: "",
            optionDescription:
              "Link zum Hintergrundbild für den Welcome-Banner (Größe 700x350 px)(Format: jpg|png):",
            optionType: DBD.formTypes.input(
              "https://.......",
              1,
              200,
              false,
              false
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "welcomeBannerPictureLink"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "welcomeBannerPictureLink"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "welcomeBannerPictureLink";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "welcomeBannerPictureLink";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "welcomeEmbed",
            optionName: "",
            optionDescription: "Willkommens DM an User senden:",
            optionType: DBD.formTypes.switch(false),
            themeOptions: {
              minimalbutton: {
                last: true
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await embedsRepository.getEmbed(
                guild,
                "welcomeMessage"
              );
              if (data) {
                if (data.dm === "1") return true;
              } else return false;
            },
            setNew: async ({ guild, newData }) => {
              let data = await embedsRepository.getEmbed(
                guild,
                "welcomeMessage"
              );

              if (!newData) newData = null;

              if (!data) {
                const column = "dm";
                await embedsRepository.addEmbed(
                  guild,
                  "welcomeMessage",
                  false,
                  false,
                  null,
                  false,
                  newData
                );
              } else {
                const column = "dm";
                await embedsRepository.updateEmbed(
                  column,
                  newData,
                  guild,
                  "welcomeMessage"
                );
              }
              return;
            }
          },
          {
            optionId: "welcomeMessagedm",
            optionName: "",
            optionDescription: "Bilder Upload funktioniert noch nicht --> WIP",
            optionType: DBD.formTypes.embedBuilder({
              username: user.username,
              avatarURL: user.avatarURL(),
              defaultJson: {
                embed: {
                  title: `⚡️ Willkommen bei PowerBot ⚡️`,
                  description: `Schön, dass du zu uns gefunden hast.\nAlle Infos zum Start bekommst du im Channel: #Welcome\n\nBei Fragen kannst du dich jederzeit an unsere Supporter wenden.`,
                  color: 39129,
                  timestamp: Date.now(),
                  footer: {
                    text: `powered by Powerbot`,
                    icon_url: `${user.displayAvatarURL()}`
                  }
                }
              }
            }),

            getActualSet: async ({ guild }) => {
              let data = await embedsRepository.getEmbed(
                guild,
                "welcomeMessage"
              );
              if (!data) {
                return null;
              } else {
                if (data.messageContent) return JSON.parse(data.messageContent);
                else return null;
              }
            },
            setNew: async ({ guild, newData }) => {
              let data = await embedsRepository.getEmbed(
                guild,
                "welcomeMessage"
              );
              newDataString = JSON.stringify(newData);

              if (!newData) newData = false;

              if (!data) {
                const column = "messageContent";
                await embedsRepository.addEmbed(
                  guild,
                  "welcomeMessage",
                  false,
                  false,
                  newDataString,
                  false,
                  false
                );
              } else {
                const column = "messageContent";
                await embedsRepository.updateEmbed(
                  column,
                  newDataString,
                  guild,
                  "welcomeMessage"
                );
              }
              return;
            }
          }
        ]
      },
      /// ################ AUTO MESSAGES END ################ \\\
      /// ################## LEVEL SYSTEM ################## \\\
      {
        categoryId: "levelsystem",
        categoryName: "Level System",
        categoryDescription:
          "Vergib Besondere Rollen an aktive User<br><br>XP pro Nachricht minimal: 6 <br> XP pro Nachricht maximal: 25<br> Level 1: 100XP || Level 10: 8200XP || Level 25: 57700XP || Level 50: 240200XP  || Level 75: 547700XP  || Level 100: 980200XP <br> Berechnung LevelUp = Level * Level * 100 + 100",

        categoryImageURL: "https://pwr.lol/img/icons/award-solid.svg",

        refreshOnSave: true,
        toggleable: true,
        getActualSet: async ({ guild }) => {
          let data = await levelsRepository.getlevelSettings(guild);

          if (data) return data.levelRolesActive;
          else return null;
        },
        setNew: async ({ guild, newData }) => {
          let data = await levelsRepository.getlevelSettings(guild);

          if (!newData) newData = null;

          if (!data) {
            const column = "levelRolesActive";
            await levelsRepository.updatelevelSettings(guild, column, newData);
          } else {
            const column = "levelRolesActive";
            await levelsRepository.updatelevelSettings(guild, column, newData);
          }
          return;
        },

        categoryOptionsList: [
          {
            optionId: "rankChannel",
            optionName: "",
            optionDescription: "Rank / Level Channel auswählen:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText])
            ),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.rankChannel;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "rankChannel";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "rankChannel";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "rankBannerPictureLink",
            optionName: "",
            optionDescription:
              "Link zum Hintergrundbild für den User-Rank-Banner (Größe 700x250 px)(Format: jpg|png):",
            optionType: DBD.formTypes.input(
              "https://.......",
              1,
              200,
              false,
              false
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "rankBannerPictureLink"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "rankBannerPictureLink"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "rankBannerPictureLink";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "rankBannerPictureLink";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "levelRolesTeam",
            optionName: "",
            optionDescription:
              "Sollen Team-Mitglieder auch leveln und Rollen bekommen?",
            optionType: DBD.formTypes.switch(false),
            themeOptions: {
              minimalbutton: {
                last: true
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.levelRolesTeam;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "levelRolesTeam";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "levelRolesTeam";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "channelTimeXP",
            optionName: "",
            optionDescription:
              "Sollen User für die Zeit, die sie in einem Voice-Channel waren, XP bekommen?",
            optionType: DBD.formTypes.switch(false),
            themeOptions: {
              minimalbutton: {
                last: true
              }
            },
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.channelTimeXP;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "channelTimeXP";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "channelTimeXP";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "channelTimeXPCategoryIds",
            optionName: "",
            optionDescription:
              "Wähle Kategorien aus, in denen User, für das verbringen in Voice-Channels, XP bekommen sollen (z.B. Gaming Bereiche):",
            optionType: DBD.formTypes.channelsMultiSelect(
              false,
              true,
              (channelTypes = [ChannelType.GuildCategory])
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data.channelTimeXPCategoryIds)
                return JSON.parse(data.channelTimeXPCategoryIds);
              else return [];
            },
            setNew: async ({ guild, newData }) => {
              let data = levelsRepository.getlevelSettings(guild);

              if (!data) {
                const column = "channelTimeXPCategoryIds";
                newDataString = JSON.stringify(newData);
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newDataString
                );
              } else {
                const column = "channelTimeXPCategoryIds";
                newDataString = JSON.stringify(newData);
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newDataString
                );
              }
              return;
            }
          },
          {
            optionId: "channelXpBoostIds",
            optionName: "",
            optionDescription:
              "Wähle Kategorien aus, in denen man doppelt so viele XP für das verbringen in Voice-Channels bekommt:",
            optionType: DBD.formTypes.channelsMultiSelect(
              false,
              true,
              (channelTypes = [ChannelType.GuildCategory])
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data.channelXpBoostIds)
                return JSON.parse(data.channelXpBoostIds);
              else return [];
            },
            setNew: async ({ guild, newData }) => {
              let data = levelsRepository.getlevelSettings(guild);

              if (!data) {
                const column = "channelXpBoostIds";
                newDataString = JSON.stringify(newData);
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newDataString
                );
              } else {
                const column = "channelXpBoostIds";
                newDataString = JSON.stringify(newData);
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newDataString
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp1",
            optionName: "ROLLENBELOHNUNG 1:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("1", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp1;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp1";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp1";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level1",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level1;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level1";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level1";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp2",
            optionName: "ROLLENBELOHNUNG 2:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("3", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp2;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp2";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp2";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level2",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level2;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level2";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level2";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp3",
            optionName: "ROLLENBELOHNUNG 3:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("5", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp3;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp3";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp3";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level3",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level3;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level3";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level3";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp4",
            optionName: "ROLLENBELOHNUNG 4:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("8", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp4;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp4";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp4";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level4",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level4;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level4";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level4";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp5",
            optionName: "ROLLENBELOHNUNG 5:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("10", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp5;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp5";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp5";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level5",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level5;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level5";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level5";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp6",
            optionName: "ROLLENBELOHNUNG 6:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("13", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp6;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp6";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp6";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level6",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level6;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level6";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level6";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp7",
            optionName: "ROLLENBELOHNUNG 7:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("16", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp7;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp7";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp7";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level7",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level7;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level7";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level7";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp8",
            optionName: "ROLLENBELOHNUNG 8:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("20", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp8;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp8";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp8";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level8",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level8;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level8";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level8";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp9",
            optionName: "ROLLENBELOHNUNG 9:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("30", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp9;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp9";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp9";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level9",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level9;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level9";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level9";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "LevelUp10",
            optionName: "ROLLENBELOHNUNG 10:",
            optionDescription: "Rollenbelohnung mit Level:",
            optionType: DBD.formTypes.input("50", 1, 3, false, false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.LevelUp10;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "LevelUp10";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "LevelUp10";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "level10",
            optionName: "",
            optionDescription: "Rolle:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (data) return data.level10;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await levelsRepository.getlevelSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "level10";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "level10";
                await levelsRepository.updatelevelSettings(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          }
        ]
      },
      /// ################ LEVEL SYSTEM END ################ \\\
      /// ################## AUTO MOD SYSTEM ################## \\\
      {
        categoryId: "automodsystem",
        categoryName: "Auto Mod",
        categoryDescription:
          "Einstellungen für die automatische Moderation von Usern.",
        categoryImageURL: "https://pwr.lol/img/icons/user-shield-solid.svg",
        refreshOnSave: true,
        toggleable: true,

        getActualSet: async ({ guild }) => {
          let data = await autoModRepository.getGuildAutoModSettings(guild);
          if (data) return data.autoModWarnings;
          else return null;
        },
        setNew: async ({ guild, newData }) => {
          let data = await autoModRepository.getGuildAutoModSettings(guild);

          if (!newData) newData = null;

          if (!data) {
            const column = "autoModWarnings";
            await autoModRepository.updateAutoModSettingsDashboard(
              guild,
              column,
              newData
            );
          } else {
            const column = "autoModWarnings";
            await autoModRepository.updateAutoModSettingsDashboard(
              guild,
              column,
              newData
            );
          }
          return;
        },

        categoryOptionsList: [
          {
            optionId: "autoModBadwords",
            optionName: "",
            optionDescription:
              "Sollen User verwarnt werden, wenn sie Schimpfwörter posten?",
            optionType: DBD.formTypes.switch(false),

            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "autoModBadwords"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "autoModBadwords"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "autoModBadwords";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "autoModBadwords";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "badwords",
            optionName: "",
            optionDescription: "Schimpfwörter",
            optionType: SoftUI.formTypes.tagInput(false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "badwords"
              );

              if (data) return JSON.parse(data.value);
              else
                return [
                  "Analbaron",
                  "Analraupe",
                  "Analzone",
                  "Fettsau",
                  "Fotze",
                  "Schlampe",
                  "Slut",
                  "analritter",
                  "arschficker",
                  "arschgeburt",
                  "asshole",
                  "motherfucker",
                  "biatch",
                  "bimbo",
                  "bitch",
                  "bitches",
                  "eierlutscher",
                  "fickfehler",
                  "kanacke",
                  "kanake",
                  "kanaken",
                  "kotgeburt",
                  "motherfucker",
                  "mutterficker",
                  "neger",
                  "nigga",
                  "nigger",
                  "nuttensohn",
                  "nuttentochter",
                  "schwuchtel"
                ];
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "badwords"
              );

              if (!data) {
                const property = "badwords";
                newDataString = JSON.stringify(newData);
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              } else {
                const property = "badwords";
                newDataString = JSON.stringify(newData);
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newDataString
                );
              }
              return;
            }
          },
          {
            optionId: "autoModInvites",
            optionName: "",
            optionDescription:
              "Sollen User verwarnt werden, wenn sie Einladungslinks von anderen Discords posten?",
            optionType: DBD.formTypes.switch(false),

            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "autoModInvites"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "autoModInvites"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "autoModInvites";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "autoModInvites";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "warnsCount01",
            optionName: "Warn Sanktion 01:",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Anzahl der Warns auswählen": "0",
                "User soll bei 1 Warn": "1",
                "User soll bei 2 Warns": "2",
                "User soll bei 3 Warns": "3",
                "User soll bei 4 Warns": "4",
                "User soll bei 5 Warns": "5",
                "User soll bei 6 Warns": "6",
                "User soll bei 7 Warns": "7",
                "User soll bei 8 Warns": "8",
                "User soll bei 9 Warns": "9",
                "User soll bei 10 Warns": "10"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.warnsCount01;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "warnsCount01";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "warnsCount01";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "duration01",
            optionName: "",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Zeitraum auswählen": "0",
                "6 Stunden": "6h",
                "12 Stunden": "12h",
                "24 Stunden": "24h",
                "1 Woche": "1w",
                "2 Wochen": "2w",
                "4 Wochen": "4w",
                "1 Monat": "1m",
                "2 Monate": "2m",
                "4 Monate": "4m",
                "**dauerhaft**": "dauerhaft"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.duration01;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "duration01";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "duration01";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "sanctionType01",
            optionName: "",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Sanktion auswählen": "0",
                "getimeouted werden!": "timeout",
                "temporär gebannt werden!": "tempban",
                "gebannt werden!": "ban"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.sanctionType01;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "sanctionType01";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "sanctionType01";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "warnsCount02",
            optionName: "Warn Sanktion 02:",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Anzahl der Warns auswählen": "0",
                "User soll bei 1 Warn": "1",
                "User soll bei 2 Warns": "2",
                "User soll bei 3 Warns": "3",
                "User soll bei 4 Warns": "4",
                "User soll bei 5 Warns": "5",
                "User soll bei 6 Warns": "6",
                "User soll bei 7 Warns": "7",
                "User soll bei 8 Warns": "8",
                "User soll bei 9 Warns": "9",
                "User soll bei 10 Warns": "10"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.warnsCount02;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "warnsCount02";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "warnsCount02";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "duration02",
            optionName: "",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Zeitraum auswählen": "0",
                "6 Stunden": "6h",
                "12 Stunden": "12h",
                "24 Stunden": "24h",
                "1 Woche": "1w",
                "2 Wochen": "2w",
                "4 Wochen": "4w",
                "1 Monat": "1m",
                "2 Monate": "2m",
                "4 Monate": "4m",
                "**dauerhaft**": "dauerhaft"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.duration02;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "duration02";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "duration02";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "sanctionType02",
            optionName: "",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Sanktion auswählen": "0",
                "getimeouted werden!": "timeout",
                "temporär gebannt werden!": "tempban",
                "gebannt werden!": "ban"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.sanctionType02;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "sanctionType02";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "sanctionType02";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "warnsCount03",
            optionName: "Warn Sanktion 03:",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Anzahl der Warns auswählen": "0",
                "User soll bei 1 Warn": "1",
                "User soll bei 2 Warns": "2",
                "User soll bei 3 Warns": "3",
                "User soll bei 4 Warns": "4",
                "User soll bei 5 Warns": "5",
                "User soll bei 6 Warns": "6",
                "User soll bei 7 Warns": "7",
                "User soll bei 8 Warns": "8",
                "User soll bei 9 Warns": "9",
                "User soll bei 10 Warns": "10"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.warnsCount03;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "warnsCount03";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "warnsCount03";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "duration03",
            optionName: "",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Zeitraum auswählen": "0",
                "6 Stunden": "6h",
                "12 Stunden": "12h",
                "24 Stunden": "24h",
                "1 Woche": "1w",
                "2 Wochen": "2w",
                "4 Wochen": "4w",
                "2 Monat": "2m",
                "4 Monate": "4m",
                "6 Monate": "6m",
                "**dauerhaft**": "dauerhaft"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.duration03;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "duration03";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "duration03";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "sanctionType03",
            optionName: "",
            optionDescription: "",
            optionType: DBD.formTypes.select(
              {
                "Sanktion auswählen": "0",
                "getimeouted werden!": "timeout",
                "temporär gebannt werden!": "tempban",
                "gebannt werden!": "ban"
              },
              false
            ),
            allowedCheck: async ({ guild }) => {
              const guildPremium = await powerbotManagement.getValue(
                guild,
                "premium"
              );

              if (guildPremium) {
                return { allowed: true };
              } else {
                return {
                  allowed: false,
                  errorMessage:
                    "Für dieses Feature benötigst du Premium Power =)"
                };
              }
            },
            getActualSet: async ({ guild }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);
              if (data) return data.sanctionType03;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await autoModRepository.getGuildAutoModSettings(guild);

              if (!newData) newData = null;

              if (!data) {
                const column = "sanctionType03";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              } else {
                const column = "sanctionType03";
                await autoModRepository.updateAutoModSettingsDashboard(
                  guild,
                  column,
                  newData
                );
              }
              return;
            }
          }
        ]
      },
      /// ################ AUTO MOD SYSTEM END ################ \\\
      /// ################## SOCIAL CHECK SYSTEM ################## \\\
      {
        categoryId: "socialfeed",
        categoryName: "Social Alerts",
        categoryDescription:
          "Erstellt automatische Ankündigungen, wenn ein Video bei YouTube hochgeladen oder ein Post bei Insta, Facebook, ... veröffentlicht worden ist.",
        categoryImageURL: "",
        refreshOnSave: true,
        categoryOptionsList: [
          {
            optionId: "socialPostChannel",
            optionName: "",
            optionDescription: "Social-Alert Channel:",
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [ChannelType.GuildText, ChannelType.GuildAnnouncement])
            ),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "socialPostChannel"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "socialPostChannel"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "socialPostChannel";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "socialPostChannel";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "socialPingRole",
            optionName: "",
            optionDescription: "Soll eine Rolle gepingt werden?:",
            optionType: DBD.formTypes.rolesSelect(false),
            getActualSet: async ({ guild }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "socialPingRole"
              );

              if (data) return data.value;
              else return null;
            },
            setNew: async ({ guild, newData }) => {
              let data = await guildsRepository.getGuildSetting(
                guild,
                "socialPingRole"
              );

              if (!newData) newData = null;

              if (!data) {
                const property = "socialPingRole";
                await guildsRepository.insertGuildSetting(
                  guild,
                  property,
                  newData
                );
              } else {
                const property = "socialPingRole";
                await guildsRepository.updateGuildSetting(
                  guild,
                  property,
                  newData
                );
              }
              return;
            }
          },
          {
            optionId: "ytChannelLinks",
            optionName: "",
            optionDescription:
              "Links zu YouTube Channeln, von denen du Benachrichtigungen erhalten möchtest.\nWICHTIG: Es muss immer die vollständige Kanal-URL inkl. Channel-ID angegeben werden.\nBeispiel: https://www.youtube.com/channel/UCeo4KWMuoe6U31SCeb_Wnxg",
              optionType: SoftUI.formTypes.tagInput(false),
              getActualSet: async ({ guild }) => {
                let data = await guildsRepository.getGuildSetting(
                  guild,
                  "ytChannelLinks"
                );
  
                if (data) return JSON.parse(data.value);
                else
                  return [];
              },
              setNew: async ({ guild, newData }) => {
                let data = await guildsRepository.getGuildSetting(
                  guild,
                  "ytChannelLinks"
                );
  
                if (!data) {
                  const property = "ytChannelLinks";
                  newDataString = JSON.stringify(newData);
                  await guildsRepository.insertGuildSetting(
                    guild,
                    property,
                    newDataString
                  );
                } else {
                  const property = "ytChannelLinks";
                  newDataString = JSON.stringify(newData);
                  await guildsRepository.updateGuildSetting(
                    guild,
                    property,
                    newDataString
                  );
                }
                return;
              }
          },
        ]
      }
      /// ################ SOCIAL CHECK SYSTEM END ################ \\\
    ],
    customPages: [
      DBD.customPagesTypes.renderHtml(`/leaderboard`, ({ user, guild }) => {
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Test</title>
            </head>
            <body>
                <h1>Ich werde ein Leaderboard</h1>
            </body>
        </html>
        `;
      })
    ]
  });
  Dashboard.init();
};

function CommandPush(filteredArray, CategoryArray) {
  filteredArray.forEach(obj => {
    let cmdObject = {
      commandName: obj.name,
      commandUsage: "/" + obj.name,
      commandDescription: obj.description,
      commandAlias: "None"
    };
    CategoryArray.push(cmdObject);
  });
}

module.exports.init = init;
