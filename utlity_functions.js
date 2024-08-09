const { GroupChat } = require("whatsapp-web.js");
const communityName = process.env.COMMUNITY_NAME;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//Create Group
async function createGroup(client, groupName) {
  try {
    const group = await client.createGroup(groupName);
    console.log(`Group "${groupName}" created successfully!`);
    console.log("Group Details:", group);

    //   console.log("Group Members:", group.participants.map((participant) => participant.id._serialized));
    return group;
  } catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
}

// Function to add a member to a group
async function addMemberToGroup(client, groupName, phoneNumber) {
  try {
    const chats = await client.getChats();
    let myGroup = chats.find((chat) => chat.name === groupName);
    if (!myGroup) {
      // console.log(`Group:${groupName} doesnt exist`);
      return {
        status: false,
        message: `Group:${groupName} doesnt exist`,
      };
    } else await myGroup.addParticipants([phoneNumber + "@c.us"]);
    console.log(
      `Member with phone number ${phoneNumber} added to group ${groupName} successfully!`
    );
    return {
      status: true,
      message: `Member with phone number ${phoneNumber} added to group ${groupName} successfully!`,
    };
  } catch (error) {
    console.error(`Error adding member to group:`, error);
    return {
      status: false,
      message: error.message,
    };
  }
}

// Function to remove a member from a group
async function removeMemberFromGroup(client, groupName, phoneNumber) {
  try {
    const chats = await client.getChats();
    const myGroup = chats.find((chat) => chat.name === groupName);
    if (!myGroup) {
      return {
        status: false,
        message: `Group ${groupName} not found`,
      };
    }
    await myGroup.removeParticipants([phoneNumber + "@c.us"]);
    console.log(
      `Member with phone number ${phoneNumber} removed from group ${groupName} successfully!`
    );
    return {
      status: true,
      message: `Member with phone number ${phoneNumber} removed from group ${groupName} successfully!`,
    };
  } catch (error) {
    console.error(`Error removing member from group:`, error);
    return {
      status: false,
      message: error.message,
    };
  }
}

//Remove Member from Community
async function RemoveMemberFromCommunity(client, phoneNumber) {
  try {
    const chats = await client.getChats();
    const community = await chats.filter((chat) => chat.name == communityName);
    if (community.length == 0) {
      return {
        status: false,
        message: `Community ${communityName} not found`,
      };
    }
    // console.log(`Community FOund`, community);
    // console.log(`Number`, phoneNumber);
    await community[0].removeParticipants([phoneNumber + "@c.us"]);

    const CommunityGroups = await GetCommunityGroups(); //API call

    CommunityGroups.forEach(async (groupName) => {
      const response = await removeMemberFromGroup(
        client,
        groupName,
        phoneNumber
      );
    });

    return {
      status: true,
      message: `Member with phone number ${phoneNumber} removed from community successfully!`,
    };
  } catch (error) {
    console.error(`Error removing member from group:`, error);
    return {
      status: false,
      message: error.message,
    };
  }
}
async function GetCommunityGroups() {
  let groups = process.env.COMMUNITY_GROUPS.split(",");
  // let groups = ["Test Group 1", "Test Group 2", "Test Group 3"];
  return groups;
}

//Deleting messages from Group Name
async function deleteMessagesFromGroupName(
  client,
  groupName,
  phoneNumber,
  timeFrameInHours
) {
  try {
    const chats = await client.getChats();
    const now = new Date();
    const timeFrameInMilliseconds = timeFrameInHours * 60 * 60 * 1000;

    const chat = await chats.filter((chat) => chat.name == groupName);
    if (chat.length == 0) {
      return {
        status: false,
        message: `Group ${groupName} not found`,
      };
    }
    var messageArray = [];
    const messages = await chat[0].fetchMessages({ limit: 100 });
    for (const message of messages) {
      if (message.author && message.author.includes(phoneNumber)) {
        const messageDate = new Date(message.timestamp * 1000);
        if (now - messageDate <= timeFrameInMilliseconds) {
          if (message.body != "") {
            console.log(`Message To be deleted:`, message.body);
            console.log(`Message Date`, messageDate);
            messageArray.push(message);
          }
        }
      }
    }

    for (const message of messageArray) {
      await DeleteMessage(message);
      await delay(3000);
    }

    console.log(
      `All messages from ${phoneNumber} within the last ${timeFrameInHours} hours have been deleted ...`
    );
    return {
      status: true,
      message: `All messages from ${phoneNumber} within the last ${timeFrameInHours} hours have been deleted...`,
    };
  } catch (error) {
    console.error(`Error deleting messages:`, error);
    return {
      status: false,
      message: error.message,
    };
  }
}

//Delete Messages from Community
async function deleteMessagesFromCommunity(
  client,
  phoneNumber,
  timeFrameInHours
) {
  try {
    const groups = await GetCommunityGroups();
    for (const group of groups) {
      await deleteMessagesFromGroupName(
        client,
        group,
        phoneNumber,
        timeFrameInHours
      );
    }

    console.log(
      `All messages from ${phoneNumber} within the last ${timeFrameInHours} hours have been deleted from Community...`
    );
    return {
      status: true,
      message: `All messages from ${phoneNumber} within the last ${timeFrameInHours} hours have been deleted from Community ...`,
    };
  } catch (error) {
    console.error(`Error deleting messages:`, error);
    return {
      status: false,
      message: error.message,
    };
  }
}

const DeleteMessage = async (message) => {
  try {
    const result = await message.delete(true);
    // console.log(`Message Deleted`, result);
  } catch (err) {
    console.log(`Error`, err);
  }
};

module.exports = {
  GetCommunityGroups,
  createGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  RemoveMemberFromCommunity,
  deleteMessagesFromGroupName,
  deleteMessagesFromCommunity,
};
