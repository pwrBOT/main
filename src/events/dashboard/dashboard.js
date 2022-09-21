const { Client, ChannelType } = require("discord.js");
const DarkDashboard = require("dbd-dark-dashboard");
const DBD = require("discord-dashboard");
const config = require(`../../../config.json`);
const levelsRepository = require("../../mysql/levelsRepository");
const embedsRepository = require("../../mysql/embedsRepository");
const autoModRepository = require("../../mysql/autoModRepository");

/// NEW
const guildsRepository = require("../../mysql/guildsRepository");

module.exports = {
  name: "ready",

  async execute(client) {
    let info = [];
    let moderation = [];
    let warning = [];
    let admintools = [];

    const { user } = client;
    const information = client.commands.filter((x) => x.category === "info");
    const mod = client.commands.filter((x) => x.category === "moderation");
    const warnsystem = client.commands.filter((x) => x.category === "warning");
    const admin = client.commands.filter((x) => x.category === "admintools");

    CommandPush(information, info);
    CommandPush(mod, moderation);
    CommandPush(warnsystem, warning);
    CommandPush(admin, admintools);

    await DBD.useLicense(config.powerbot_dashboard);
    DBD.Dashboard = DBD.UpdatedClass();

    const Dashboard = new DBD.Dashboard({
      port: 8010,
      client: {
        id: config.powerbot_clientId,
        secret: config.powerbot_clientSecret,
      },
      redirectUri: "http://dashboard.pwr.lol/discord/callback/",
      domain: "http://dashboard.pwr.lol",
      bot: client,
      supportServer: {
        slash: "/support",
        inviteURL: "https://discord.gg/QfDNMCxzsN",
      },
      acceptPrivacyPolicy: true,
      minimizedConsoleLogs: true,
      guildAfterAuthorization: {
        use: true,
        guildId: config.powerbot_guildId,
      },
      invite: {
        clientId: client.user.id,
        scopes: ["bot", "applications.commands", "guilds", "identify"],
        permissions: "1644971949303",
        redirectUri: "http://dashboard.pwr.lol/discord/callback/",
      },
      theme: DarkDashboard({
        information: {
          createdBy: "PowerBot Team",
          websiteTitle: "PowerBot | Dashboard",
          websiteName: "PowerBot",
          websiteUrl: "/",
          dashboardUrl: "http://localhost:3000/",
          supporteMail: "power@pwr.lol",
          supportServer: "https://discord.gg/yYq4UgRRzz",
          imageFavicon: "https://pwr.lol/img/bot_logo.jpg",
          iconURL: "https://pwr.lol/img/bot_logo.jpg",
          loggedIn: "Erfolgreich eingeloggt.",
          mainColor: "#f43638",
          subColor: "#ffffff",
          preloader: "Loading...",
        },

        sidebar: {
          keepDefault: false,
          list: [
            {
              icon: `<svg style="position: absolute; margin-left: 8px; margin-top: 2px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#f43638">    <path d="M0 0h24v24H0z" fill="none"/> <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z"/> <path d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>`,
              title: "Dashboard",
              link: "/",
              id: "dashboard",
            },
            {
              icon: `<svg style="position: absolute; margin-left: 8px; margin-top: 2px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#f43638">    <path d="M4,18v-0.65c0-0.34,0.16-0.66,0.41-0.81C6.1,15.53,8.03,15,10,15c0.03,0,0.05,0,0.08,0.01c0.1-0.7,0.3-1.37,0.59-1.98 C10.45,13.01,10.23,13,10,13c-2.42,0-4.68,0.67-6.61,1.82C2.51,15.34,2,16.32,2,17.35V20h9.26c-0.42-0.6-0.75-1.28-0.97-2H4z"></path><path d="M10,12c2.21,0,4-1.79,4-4s-1.79-4-4-4C7.79,4,6,5.79,6,8S7.79,12,10,12z M10,6c1.1,0,2,0.9,2,2s-0.9,2-2,2 c-1.1,0-2-0.9-2-2S8.9,6,10,6z"></path><path d="M20.75,16c0-0.22-0.03-0.42-0.06-0.63l1.14-1.01l-1-1.73l-1.45,0.49c-0.32-0.27-0.68-0.48-1.08-0.63L18,11h-2l-0.3,1.49 c-0.4,0.15-0.76,0.36-1.08,0.63l-1.45-0.49l-1,1.73l1.14,1.01c-0.03,0.21-0.06,0.41-0.06,0.63s0.03,0.42,0.06,0.63l-1.14,1.01 l1,1.73l1.45-0.49c0.32,0.27,0.68,0.48,1.08,0.63L16,21h2l0.3-1.49c0.4-0.15,0.76-0.36,1.08-0.63l1.45,0.49l1-1.73l-1.14-1.01 C20.72,16.42,20.75,16.22,20.75,16z M17,18c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S18.1,18,17,18z"></path></svg>`,
              title: "Discord Server verwalten",
              link: "/manage",
              id: "manage",
            },
            {
              icon: `<svg style="position: absolute; margin-left: 8px; margin-top: 2px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 16 16" width="24px" fill="#f43638">    <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/></svg>`,
              title: "Bot Command-Übersicht",
              link: "/commands",
              id: "commands",
            },
            {
              icon: `<svg style="position: absolute; margin-left: 8px; margin-top: 2px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 16 16" width="24px" fill="#009999">    <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z"/></svg>`,
              title: "PowerBot Support Server",
              link: "https://discord.gg/QfDNMCxzsN",
              id: "supportserver",
            },
          ],
        },

        guilds: {
          cardTitle: "Discord Server",
          cardDescription: "Hier kannst du all deine Discord Server verwalten:",
          type: "blurlist",
        },

        index: {
          card: {
            category: "",
            title: `PowerBot - Hol dir die ultimative Power für deinen Discord Server`,
            image: "https://pwr.lol/img/Promo-1-de.jpg",
            footer: "",
          },

          information: {
            category: "Category",
            title: "Information",
            description: `This bot and panel is currently a work in progress so contact me if you find any issues on discord.`,
            footer: "Footer",
          },

          feeds: {
            category: "Category",
            title: "Information",
            description: `This bot and panel is currently a work in progress so contact me if you find any issues on discord.`,
            footer: "Footer",
          },
        },

        commands: [
          {
            category: `Admin Tools`,
            subTitle: `Commands für Admins`,
            aliasesDisabled: true,
            list: admintools,
          },
          {
            category: `Moderation`,
            subTitle: `Commands zur Moderation von Usern`,
            aliasesDisabled: true,
            list: moderation,
          },
          {
            category: `Warn-System`,
            subTitle: `Zur Moderation von Usern`,
            aliasesDisabled: true,
            list: warning,
          },
          {
            category: `Allgemeines`,
            subTitle: `Allgemeine Commands`,
            aliasesDisabled: true,
            list: info,
          },
        ],
      }),
      settings: [
        /// ################## BOT SETTINGS ################## \\\
        {
          categoryId: "adminsettings",
          categoryName: "Bot-Admin Einstellungen",
          categoryDescription:
            "Definiere die jeweiligen Bot-Channel (Bot-Log, Mod-Log, Welcome-Channel, ...)",
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
              },
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
              },
            },
            {
              optionId: "modRole",
              optionName: "",
              optionDescription: "Moderator Rolle:",
              optionType: DBD.formTypes.rolesSelect(false),
              getActualSet: async ({ guild }) => {
                let data = await guildsRepository.getGuildSetting(
                  guild,
                  "modRole"
                );

                if (data) return data.value;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await guildsRepository.getGuildSetting(
                  guild,
                  "modRole"
                );

                if (!newData) newData = null;

                if (!data) {
                  const property = "modRole";
                  await guildsRepository.insertGuildSetting(
                    guild,
                    property,
                    newData
                  );
                } else {
                  const property = "modRole";
                  await guildsRepository.updateGuildSetting(
                    guild,
                    property,
                    newData
                  );
                }
                return;
              },
            },
            {
              optionId: "muteRole",
              optionName: "",
              optionDescription: "Mute Rolle:",
              optionType: DBD.formTypes.rolesSelect(false),
              getActualSet: async ({ guild }) => {
                let data = await guildsRepository.getGuildSetting(
                  guild,
                  "muteRole"
                );

                if (data) return data.value;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await guildsRepository.getGuildSetting(
                  guild,
                  "muteRole"
                );

                if (!newData) newData = null;

                if (!data) {
                  const property = "muteRole";
                  await guildsRepository.insertGuildSetting(
                    guild,
                    property,
                    newData
                  );
                } else {
                  const property = "muteRole";
                  await guildsRepository.updateGuildSetting(
                    guild,
                    property,
                    newData
                  );
                }
                return;
              },
            },
            /// ########## CHANNEL SETTINGS ########## \\\
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
              },
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
              },
            },
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
              },
            },
            /// ########## MISC SETTINGS ########## \\\
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
              },
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
              },
            },
          ],
        },
        /// ################ BOT SETTINGS END ################ \\\
        /// ################## AUTO MESSAGES ################## \\\
        {
          categoryId: "automessages",
          categoryName: "Automatische Bot-Nachrichten (SOON)",
          categoryDescription: "Schalte automatische Nachrichten an / aus",
          categoryOptionsList: [
            {
              optionId: "welcomeMessage",
              optionName: "Willkommensnachricht DM:",
              optionDescription: "Willkommensnachricht DM ein/aus:",
              optionType: DBD.formTypes.switch(false),
              themeOptions: {
                minimalbutton: {
                  first: true,
                },
              },
              getActualSet: async ({ guild }) => {
                let data = await embedsRepository.getEmbed(
                  guild,
                  "welcomeMessage"
                );
                if (data) return data.active;
                else return false;
              },
              setNew: async ({ guild, newData }) => {
                let data = await embedsRepository.getEmbed(
                  guild,
                  "welcomeMessage"
                );

                if (!newData) newData = null;

                if (!data) {
                  const column = "active";
                  await embedsRepository.addEmbed(
                    guild,
                    "welcomeMessage",
                    newData,
                    false,
                    null,
                    false,
                    false
                  );
                } else {
                  const column = "active";
                  await embedsRepository.updateEmbed(
                    column,
                    newData,
                    guild,
                    "welcomeMessage"
                  );
                }
                return;
              },
            },
            {
              optionId: "welcomeEmbed",
              optionName: "",
              optionDescription: "Willkommens-Embed:",
              optionType: DBD.formTypes.switch(false),
              themeOptions: {
                minimalbutton: {
                  last: true,
                },
              },
              getActualSet: async ({ guild }) => {
                let data = await embedsRepository.getEmbed(
                  guild,
                  "welcomeMessage"
                );
                if (data) return data.embed;
                else return false;
              },
              setNew: async ({ guild, newData }) => {
                let data = await embedsRepository.getEmbed(
                  guild,
                  "welcomeMessage"
                );

                if (!newData) newData = null;

                if (!data) {
                  const column = "embed";
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
                  const column = "embed";
                  await embedsRepository.updateEmbed(
                    column,
                    newData,
                    guild,
                    "welcomeMessage"
                  );
                }
                return;
              },
            },

            {
              optionId: "welcomeMessagedm",
              optionName: "",
              optionDescription: "",
              optionType: DBD.formTypes.embedBuilder({
                username: user.username,
                avatarURL: user.avatarURL(),
                defaultJson: {
                  embed: {
                    title: `⚡️ Willkommen bei PowerBot ⚡️`,
                    description: `Schön, dass du zu uns gefunden hast.\nAlle Infos zum Start bekommst du im Channel: #Welcome\n\nBei Fragen kannst du dich jederzeit an unsere Supporter wenden.`,
                    color: "GREEN",
                    timestamp: Date.now(),
                    footer: {
                      text: `powered by Powerbot`,
                      icon_url: `${user.displayAvatarURL()}`,
                    },
                  },
                },
              }),

              getActualSet: async ({ guild }) => {
                let data = await embedsRepository.getEmbed(
                  guild,
                  "welcomeMessage"
                );
                if (!data) {
                  return null;
                } else {
                  if (data.messageContent)
                    return JSON.parse(data.messageContent);
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
              },
            },
          ],
        },
        /// ################ AUTO MESSAGES END ################ \\\
        /// ################## LEVEL SYSTEM ################## \\\
        {
          categoryId: "levelsystem",
          categoryName: "Level System",
          categoryDescription: "Vergib Besondere Rollen an aktive User",
          categoryOptionsList: [
            {
              optionId: "levelRolesActive",
              optionName: "",
              optionDescription: "Level Auto-Roles an/aus:",
              optionType: DBD.formTypes.switch(false),
              themeOptions: {
                minimalbutton: {
                  first: true,
                },
              },
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
                  await levelsRepository.updatelevelSettings(
                    guild,
                    column,
                    newData
                  );
                } else {
                  const column = "levelRolesActive";
                  await levelsRepository.updatelevelSettings(
                    guild,
                    column,
                    newData
                  );
                }
                return;
              },
            },
            {
              optionId: "levelRolesTeam",
              optionName: "",
              optionDescription: "Level-Rolle bei Teammitgliedern an/aus:",
              optionType: DBD.formTypes.switch(false),
              themeOptions: {
                minimalbutton: {
                  last: true,
                },
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
              },
            },
            {
              optionId: "level1",
              optionName: "",
              optionDescription: "Rolle Level 1:",
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
              },
            },
            {
              optionId: "level2",
              optionName: "",
              optionDescription: "Rolle Level 2:",
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
              },
            },
            {
              optionId: "level3",
              optionName: "",
              optionDescription: "Rolle Level 3:",
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
              },
            },
            {
              optionId: "level4",
              optionName: "",
              optionDescription: "Rolle Level 4:",
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
              },
            },
            {
              optionId: "level5",
              optionName: "",
              optionDescription: "Rolle Level 5:",
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
              },
            },
            {
              optionId: "level6",
              optionName: "",
              optionDescription: "Rolle Level 6:",
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
              },
            },
            {
              optionId: "level7",
              optionName: "",
              optionDescription: "Rolle Level 7:",
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
              },
            },
            {
              optionId: "level8",
              optionName: "",
              optionDescription: "Rolle Level 8:",
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
              },
            },
            {
              optionId: "level9",
              optionName: "",
              optionDescription: "Rolle Level 9:",
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
              },
            },
            {
              optionId: "level10",
              optionName: "",
              optionDescription: "Rolle Level 10:",
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
              },
            },
          ],
        },
        /// ################ LEVEL SYSTEM END ################ \\\
        /// ################## AUTO MOD SYSTEM ################## \\\
        {
          categoryId: "autmodsystem",
          categoryName: "Auto Moderation (SOON)",
          categoryDescription:
            "Einstellungen für die automatische Moderation von Usern.",
          categoryOptionsList: [
            {
              optionType: "spacer",
              title: "Automatische Moderation",
              description: "### soon ###",
            },
            {
              optionType: "spacer",
              title: "Warn System | Auto Mod",
              description: "",
            },
            {
              optionId: "autoModWarnings",
              optionName: "",
              optionDescription: "Auto-Moderation bei Warns an/aus:",
              optionType: DBD.formTypes.switch(false),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.autoModWarnings;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
            },
            {
              optionType: "spacer",
              title: "",
              description: "Warn Sanktion 01:",
            },
            {
              optionId: "warnsCount01",
              optionName: "",
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
                  "User soll bei 10 Warns": "10",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.warnsCount01;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
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
                  "**dauerhaft**": "dauerhaft",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.duration01;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
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
                  "gebannt werden!": "ban",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.sanctionType01;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
            },
            {
              optionType: "spacer",
              title: "",
              description: "Warn Sanktion 02:",
            },
            {
              optionId: "warnsCount02",
              optionName: "",
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
                  "User soll bei 10 Warns": "10",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.warnsCount02;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
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
                  "**dauerhaft**": "dauerhaft",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.duration02;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
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
                  "gebannt werden!": "ban",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.sanctionType02;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
            },
            {
              optionType: "spacer",
              title: "",
              description: "Warn Sanktion 03:",
            },
            {
              optionId: "warnsCount03",
              optionName: "",
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
                  "User soll bei 10 Warns": "10",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.warnsCount03;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
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
                  "**dauerhaft**": "dauerhaft",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.duration03;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
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
                  "gebannt werden!": "ban",
                },
                false
              ),
              getActualSet: async ({ guild }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );
                if (data) return data.sanctionType03;
                else return null;
              },
              setNew: async ({ guild, newData }) => {
                let data = await autoModRepository.getGuildAutoModSettings(
                  guild
                );

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
              },
            },
          ],
        },
        /// ################ AUTO MOD SYSTEM END ################ \\\
      ],
    });
    Dashboard.init();
  },
};

function CommandPush(filteredArray, CategoryArray) {
  filteredArray.forEach((obj) => {
    let cmdObject = {
      commandName: obj.name,
      commandUsage: "/" + obj.name,
      commandDescription: obj.description,
      commandAlias: "None",
    };
    CategoryArray.push(cmdObject);
  });
}
