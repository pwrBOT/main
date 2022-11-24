const { Client, ChannelType } = require("discord.js");
const DarkDashboard = require("dbd-dark-dashboard");
const SoftUI = require("dbd-soft-ui");
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
        token: config.powerbot_token,
        client: {
          id: config.powerbot_clientId,
          secret: config.powerbot_clientSecret
        }
      },
      redirectUri: "http://dashboard.pwr.lol/discord/callback/",
      domain: "http://dashboard.pwr.lol",
      bot: client,
      ownerIDs: ["539513467313455105"],
      useThemeMaintenance: true,
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
      acceptPrivacyPolicy: true,
      minimizedConsoleLogs: true,
      bot: client,
      theme: SoftUI({
        customThemeOptions: {
          index: async ({ req, res, config }) => {
            return {
              values: [],
              graphInfo: {},
              cards: []
            };
          }
        },
        websiteName: "PowerBot",
        colorScheme: "blue",
        supporteMail: "support@pwr.lol",
        icons: {
          favicon: "https://pwr.lol/img/bot_logo.jpg",
          noGuildIcon: "https://pwr.lol/img/bot_logo.jpg",
          sidebar: {
            darkUrl: "https://pwr.lol/img/bot_logo.jpg",
            lightUrl: "https://pwr.lol/img/bot_logo.jpg",
            hideName: true,
            borderRadius: false,
            alignCenter: true
          }
        },
        preloader: {
          image: "/img/soft-ui.webp",
          spinner: false,
          text: "Page is loading"
        },
        index: {
          card: {
            category: "Soft UI",
            title: "Assistants - The center of everything",
            description:
              "Assistants Discord Bot management panel. <b><i>Feel free to use HTML</i></b>",
            image: "/img/soft-ui.webp",
            link: {
              text: "Visit the website",
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
            login: "Successfully logged in."
          }
        },
        preloader: {
          image: "/img/soft-ui.webp",
          spinner: false,
          text: "Page is loading"
        },
        admin: {
          pterodactyl: {
            enabled: false,
            apiKey: "apiKey",
            panelLink: "http://localhost:3000/",
            serverUUIDs: []
          }
        },

        commands: []
      }),
      settings: [
        {
            categoryId: 'input',
            categoryName: `New Category`,
            categoryImageURL: 'URL To image',
            categoryDescription: "Setup your bot with default settings!",
            categoryOptionsList: [
                {
    
                }
            ]
        }
    ],
    });
    Dashboard.init();
  }
};

function CommandPush(filteredArray, CategoryArray) {
  filteredArray.forEach((obj) => {
    let cmdObject = {
      commandName: obj.name,
      commandUsage: "/" + obj.name,
      commandDescription: obj.description,
      commandAlias: "None"
    };
    CategoryArray.push(cmdObject);
  });
}
