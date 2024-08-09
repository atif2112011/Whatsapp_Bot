const sharp = require("sharp");
const {
  removeMemberFromGroup,
  deleteMessagesFromGroupName,
  deleteMessagesFromCommunity,
  RemoveMemberFromCommunity,
} = require("./utlity_functions");

const Util = require("whatsapp-web.js/src/util/Util");
const { MessageMedia } = require("whatsapp-web.js");

// Handle Remove command
async function handleRemoveCommand(msg, client) {
  const sender = msg.author.substring(0, 12);
  //   const groupId = msg.from;
  //   console.log(`Sender :${sender} Group Id : ${groupId}`);

  //check if sender is Admin or not
  const groupChat = await msg.getChat();
  const groupName = groupChat.name;

  const admins = groupChat.participants.filter(
    (participant) => participant.isAdmin && participant.id.user == sender
  );
  // console.log(`Admins`, admins);
  if (admins.length == 0) {
    // msg.reply("No Admin Privileges");
    return;
  }

  const mention = msg.mentionedIds[0]; // Get the first mentioned user
  if (!mention) {
    msg.reply("Please mention a user to remove.");
    return;
  }

  // Remove the 'c.us' part if exists
  const phoneNumber = mention.replace("@c.us", "");

  const result = await removeMemberFromGroup(client, groupName, phoneNumber);

  msg.reply(result.message);
}

// Handle remove from community command
async function handleRemoveCommunity(msg, client) {
  const sender = msg.author.substring(0, 12);

  //check if sender is Admin or not
  const groupChat = await msg.getChat();
  const groupName = groupChat.name;

  const admins = groupChat.participants.filter(
    (participant) => participant.isAdmin && participant.id.user == sender
  );
  // console.log(`Admins`, admins);
  if (admins.length == 0) {
    // msg.reply("No Admin Privileges");
    return;
  }

  const mention = msg.mentionedIds[0]; // Get the first mentioned user
  if (!mention) {
    msg.reply("Please mention a user to remove.");
    return;
  }

  // Remove the 'c.us' part if exists
  const phoneNumber = mention.replace("@c.us", "");

  const result = await RemoveMemberFromCommunity(client, phoneNumber);

  msg.reply(result.message);
}

//Handle All Command
async function handleAllCommand(msg, client) {
  const groupChat = await msg.getChat();
  let response = "";
  let options = {
    mentions: [],
  };
  let contacts = [];

  for (const participant of groupChat.participants) {
    response += "@" + participant.id.user + " ";
    const contact = await client.getContactById(participant.id._serialized);
    await contacts.push(participant.id._serialized);
  }

  //   console.log(`Contacts`, contacts);
  let result = await groupChat.sendMessage(response, { mentions: contacts });
  //   console.log(`Result`, result);
}

//Handle Delete Command
async function handleDeleteCommand(msg, client) {
  const groupChat = await msg.getChat();
  const groupName = groupChat.name;
  const sender = msg.author.substring(0, 12);

  const admins = groupChat.participants.filter(
    (participant) => participant.isAdmin && participant.id.user == sender
  );
  // console.log(`Admins`, admins);
  if (admins.length == 0) {
    // msg.reply("No Admin Privileges");
    return;
  }

  const mention = msg.mentionedIds[0]; // Get the first mentioned user
  if (!mention) {
    msg.reply("Please mention a user.");
    return;
  }

  const timeinHrs = msg.body.split(" ")[2];
  if (!timeinHrs) {
    msg.reply("No time mentioned.");
  }
  // console.log(`split Data`, msg.body.split(" "));

  // Remove the 'c.us' part if exists
  const phoneNumber = mention.replace("@c.us", "");

  const result = await deleteMessagesFromGroupName(
    client,
    groupName,
    phoneNumber,
    timeinHrs
  );

  msg.reply(result.message);
}

//Handle Delete from Community
async function handleDeleteCommunity(msg, client) {
  const groupChat = await msg.getChat();
  const groupName = groupChat.name;
  const sender = msg.author.substring(0, 12);

  const admins = groupChat.participants.filter(
    (participant) => participant.isAdmin && participant.id.user == sender
  );
  // console.log(`Admins`, admins);
  if (admins.length == 0) {
    // msg.reply("No Admin Privileges");
    return;
  }

  const mention = msg.mentionedIds[0]; // Get the first mentioned user
  if (!mention) {
    msg.reply("Please mention a user.");
    return;
  }

  const timeinHrs = msg.body.split(" ")[2];
  if (!timeinHrs) {
    msg.reply("No time mentioned.");
  }
  // console.log(`split Data`, msg.body.split(" "));

  // Remove the 'c.us' part if exists
  const phoneNumber = mention.replace("@c.us", "");

  const result = await deleteMessagesFromCommunity(
    client,
    groupName,
    phoneNumber,
    timeinHrs
  );

  msg.reply(result.message);
}

//Handle Help Command
async function handleHelpCommand(msg, client) {
  let response = `Remove from Group : !remove @user\nRemove from Community : !rc @user\nDelete Message from Group: !delete @user <timeinHrs>\nDelete Message from Community: !dc @user <timeinHrs>\nMention Everyone: @all\nConvert to Sticker : !sticker
`;
  const groupChat = await msg.getChat();
  let result = await groupChat.sendMessage(response);
}

//handle Sticker Command
async function handleStickerCommand(msg, client) {
  console.log(`StickerHandler Fired`);
  // msg.reply("Sticker");
  const chat = await msg.getChat();
  const messages = await chat.fetchMessages({ limit: 2 });
  console.log(`Messages Array`, messages);
  const lastMessage = messages[0];
  console.log(`Last Message`, lastMessage);
  if (lastMessage.hasMedia) {
    const media = await lastMessage.downloadMedia();

    // if (media.mimetype.startsWith("image/")) {
    //   // Convert the image to WebP format
    //   const webpBuffer = await sharp(Buffer.from(media.data, "base64"))
    //     .webp()
    //     .toBuffer();

    //   // Create a MessageMedia object for the sticker
    //   const sticker = new MessageMedia(
    //     "image/webp",
    //     webpBuffer.toString("base64"),
    //     "sticker.webp"
    //   );

    if (media.mimetype.startsWith("image/")) {
      const sharpImage = sharp(Buffer.from(media.data, "base64"));

      // Get the metadata of the image to determine its dimensions
      const metadata = await sharpImage.metadata();
      const imageWidth = metadata.width;
      const imageHeight = metadata.height;

      // Calculate the size of the square (the smaller dimension of the image)
      const squareSize = Math.min(imageWidth, imageHeight);

      // Calculate the coordinates to crop the square from the center
      const left = Math.floor((imageWidth - squareSize) / 2);
      const top = Math.floor((imageHeight - squareSize) / 2);

      // Crop and convert the image to WebP format
      const webpBuffer = await sharpImage
        .extract({ left, top, width: squareSize, height: squareSize })
        .webp()
        .toBuffer();

      // Create a MessageMedia object for the sticker
      const sticker = new MessageMedia(
        "image/webp",
        webpBuffer.toString("base64"),
        "sticker.webp"
      );

      await chat.sendMessage(sticker, { sendMediaAsSticker: true });
    }
  } else {
    chat.sendMessage("The last message is not an image");
  }
}
module.exports = {
  handleRemoveCommand,
  handleAllCommand,
  handleDeleteCommand,
  handleDeleteCommunity,
  handleRemoveCommunity,
  handleHelpCommand,
  handleStickerCommand,
};
