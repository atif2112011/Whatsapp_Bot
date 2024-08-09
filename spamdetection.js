// spamDetection.js
const stringSimilarity = require("string-similarity"); // npm install string-similarity
const {
  deleteMessagesFromGroupName,
  removeMemberFromGroup,
} = require("./utlity_functions");

//default timeout :1min,
// default spamLimit is 5 messages in a group or same message in more than 4 groups
//Warning message is send at half of messageLimit

class SpamDetector {
  constructor(timeout = 60000, spamLimit = 3, messageLimit = 5) {
    this.messageLog = {};
    this.timeout = timeout;
    this.spamLimit = spamLimit;
    this.similarityThreshold = 0.8;
    this.messageLimit = messageLimit;
  }

  logMessage(user, groupId, messageContent) {
    // Initialize message log for the user if not exists
    if (!this.messageLog[user]) {
      this.messageLog[user] = {};
    }

    // Initialize group log for the user if not exists
    if (!this.messageLog[user][groupId]) {
      this.messageLog[user][groupId] = [];
    }

    // Log the message
    this.messageLog[user][groupId].push(messageContent);

    // Clean up old messages after a certain time to save memory
    setTimeout(() => {
      const index = this.messageLog[user][groupId].indexOf(messageContent);
      if (index > -1) {
        this.messageLog[user][groupId].splice(index, 1);
      }
    }, this.timeout);
  }

  //   isSpamming(user, groupId, messageContent) {
  //     let spamCount = 0;

  //     // Check if the user is spamming the same message across different groups
  //     for (let group in this.messageLog[user]) {
  //       if (group !== groupId) {
  //         const groupMessages = this.messageLog[user][group];
  //         if (groupMessages.includes(messageContent)) {
  //           spamCount++;
  //           if (spamCount >= this.spamLimit - 1) {
  //             return true;
  //           }
  //         }
  //       }
  //     }
  //     return false;
  //   }
  isSpammingAcrossGroups(user, groupId, messageContent) {
    let spamCount = 0;

    for (let group in this.messageLog[user]) {
      if (group !== groupId) {
        const groupMessages = this.messageLog[user][group];

        // if (groupMessages.includes(messageContent)) {
        //     spamCount++;
        //     if (spamCount >= this.spamLimit - 1) {
        //         return true;
        //     }
        // }

        const similarity = groupMessages.map((msg) =>
          stringSimilarity.compareTwoStrings(msg, messageContent)
        );
        const similarMessages = similarity.filter(
          (score) => score >= this.similarityThreshold
        ).length;

        if (similarMessages > 0) {
          spamCount++;
          if (spamCount >= this.spamLimit - 1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  async isSpammingWithinGroup(msg, client, user, groupId, messageContent) {
    // console.log(`Inside spamming check`);

    const groupMessages = this.messageLog[user][groupId];
    const similarity = groupMessages.map((msg) =>
      stringSimilarity.compareTwoStrings(msg, messageContent)
    );
    const similarMessages = similarity.filter(
      (score) => score >= this.similarityThreshold
    ).length;

    // console.log(`No of Messages`, similarMessages);
    // console.log(`Limit`, this.messageLimit);
    const halfMessageLimit = Math.floor(this.messageLimit / 2);
    // console.log(`Half Message Limit`, this.halfMessageLimit);
    if (similarMessages == halfMessageLimit) {
      await msg.reply("Continuous spamming will lead to a ban");
      //   console.log(`Limit Exceeded`);
    } else if (similarMessages >= Math.floor(this.messageLimit)) {
      //   console.log(`Limit Exceeded twice`);

      const phoneNumber = user.slice(0, 12);
      const chat = await msg.getChat();
      const groupName = await chat.name;
      const result = await deleteMessagesFromGroupName(
        client,
        groupName,
        phoneNumber,
        1
      );

      await removeMemberFromGroup(client, groupName, phoneNumber);
    }
  }
}

module.exports = SpamDetector;
