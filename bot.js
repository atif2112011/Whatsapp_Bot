const {
  Client,
  RemoteAuth,
  LocalAuth,
  MessageMedia,
} = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
require("dotenv").config();
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const {
  handleRemoveCommand,
  handleAllCommand,
  handleDeleteCommand,
  handleDeleteCommunity,
  handleRemoveCommunity,
  handleHelpCommand,
  handleStickerCommand,
} = require("./commands");
const { GetCommunityGroups } = require("./utlity_functions");
const SpamDetector = require("./spamdetection");

const timeout = process.env.SPAM_TIMELIMIT;
const spamLimit = process.env.MIN_SPAM_GRP;
const messageLimit = process.env.MIN_SPAM_MSG;
const auth_mode = process.env.AUTHENTICATION_MODE;

// console.log(timeout, spamLimit, messageLimit);

const store = new MongoStore({ mongoose: mongoose });
// const client = new Client({
//   authStrategy: new RemoteAuth({
//     store: store,
//     backupSyncIntervalMs: 300000,
//   }),
// webVersion: "2.2412.54",
// webVersionCache: {
// type: "remote",
// remotePath:
// "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
// },
// });

// const client = new Client({
//   authStrategy: new LocalAuth({
//     dataPath: "WhatsappAuth",
//   }),
//   puppeteer: {
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   },
//   webVersion: "2.2412.54",
//   // webVersionCache: {
//   // type: "remote",
//   // remotePath:
//   // "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
//   // },
// });

const options = [
  {
    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000,
    }),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    webVersion: "2.2412.54",
    // webVersionCache: {
    //   type: "remote",
    //   remotePath:
    //     "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    // },
  },
  {
    authStrategy: new LocalAuth({
      dataPath: "WhatsappAuth",
    }),
    puppeteer: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    webVersion: "2.2412.54",
    // webVersionCache: {
    // type: "remote",
    // remotePath:
    // "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    // },
  },
];
const client = new Client(options[auth_mode]);

let bot_connected = false;
let qr_code = "";

async function Startbot() {
  console.log(`Starting bot. . .`);
  await mongoose.connect(process.env.MONGODB_URI).then(() => {
    client.initialize();

    //Spam Detector Initialization
    //Messages deleted after 5mins

    const spamDetector = new SpamDetector(timeout, spamLimit, messageLimit);

    client.on("qr", (qr) => {
      // Generate and scan this code with your phone
      //   GenerateQR(qr);
      qrcode.generate(qr, { small: true });
      console.log("QR RECEIVED", qr);
      qr_code = qr;
    });

    client.on("ready", () => {
      console.log("Client is ready!");
      bot_connected = true;
      qr_code = "";
    });
    client.on("disconnected", () => {
      console.log("Client Disconnected");
      bot_connected = false;
    });

    client.on("message", async (msg) => {
      console.log(`Author: `, msg.author);
      console.log("From:", msg.from); // Log sender's name
      console.log("Message:", msg.body); // Log the messages

      if (msg.body == "!ping") {
        msg.reply("pong");
        const chat = await msg.getChat();
        const sticker = MessageMedia.fromFilePath("bot_image.png");
        chat.sendMessage(sticker, { sendMediaAsSticker: true });
      } else if (msg.body.startsWith("!remove")) {
        await handleRemoveCommand(msg, client);
      } else if (msg.body.startsWith("!rc")) {
        await handleRemoveCommunity(msg, client);
      } else if (msg.body == "@all") {
        await handleAllCommand(msg, client);
      } else if (msg.body.startsWith("!delete"))
        await handleDeleteCommand(msg, client);
      else if (msg.body.startsWith("!dc"))
        await handleDeleteCommunity(msg, client);
      else if (msg.body == "!help") await handleHelpCommand(msg, client);
      else if (msg.body == "!sticker") {
        await handleStickerCommand(msg, client);
      }

      //Spam Detection
      const chat = await msg.getChat();

      if (chat.isGroup) {
        const user = msg.author || msg.from;
        const messageContent = msg.body;
        const groupId = chat.id._serialized;

        // Log the message
        spamDetector.logMessage(user, groupId, messageContent);

        // Check if the user is spamming
        if (
          spamDetector.isSpammingAcrossGroups(user, groupId, messageContent)
        ) {
          msg.reply(
            "Please do not spam the same message across multiple groups."
          );
        }

        spamDetector.isSpammingWithinGroup(
          msg,
          client,
          user,
          groupId,
          messageContent
        );
      }
    });

    client.on("message_create", async (msg) => {
      // Fired on all message creations, including your own
      const groupChat = await msg.getChat();
      const groupName = groupChat.name;
      if (msg.fromMe) {
        console.log(`Author: `, msg.author);
        console.log("From:", msg.from); // Log sender's name
        console.log("Message:", msg.body); // Log the messages

        const CommunityGroups = await GetCommunityGroups();

        // if (CommunityGroups.includes(groupName)) {
        if (msg.body == "!ping") {
          msg.reply("pong");
          const chat = await msg.getChat();
          const sticker = MessageMedia.fromFilePath("bot_image.png");
          chat.sendMessage(sticker, { sendMediaAsSticker: true });
          // chat.sendMessage("Hello");
        } else if (msg.body.startsWith("!remove")) {
          await handleRemoveCommand(msg, client);
        } else if (msg.body.startsWith("!rc")) {
          await handleRemoveCommunity(msg, client);
        } else if (msg.body == "@all") {
          await handleAllCommand(msg, client);
        } else if (msg.body.startsWith("!delete"))
          await handleDeleteCommand(msg, client);
        else if (msg.body.startsWith("!dc"))
          await handleDeleteCommunity(msg, client);
        else if (msg.body == "!help") await handleHelpCommand(msg, client);
        else if (msg.body == "!sticker") {
          await handleStickerCommand(msg, client);
        }
      }
    });

    client.on("error", (err) => {
      console.log(`Error Found:`, err);
    });

    client.on("remote_session_saved", () => {
      console.log(`Client Session Saved`);
    });
  });
}

function check_status() {
  // console.log("bot_connected:", bot_connected);
  if (bot_connected == true) return true;
  else return false;
}
function get_qr() {
  // console.log("bot_connected:", bot_connected);
  if (get_qr != "") return qr_code;
  else return "";
}

module.exports = { Startbot, client, check_status, get_qr };
