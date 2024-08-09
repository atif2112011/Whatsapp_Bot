const express = require("express");
const app = express.Router();
const qr = require("qr-image");
const { client, check_status, get_qr } = require("./bot");
const {
  createGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  RemoveMemberFromCommunity,
  deleteMessagesFromGroupName,
  deleteMessagesFromCommunity,
} = require("./utlity_functions");

app.post("/create-group", async (req, res) => {
  try {
    if (!req.body.name) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }

    const response = await createGroup(client, req.body.name);
    if (response)
      return res.send({
        status: true,
        message: "Group Created Successfully",
      });
    else
      return res.send({
        status: false,
        message: "Error Creating Group..check logs",
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/add-group-member", async (req, res) => {
  try {
    if (!req.body.GroupName && !req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }

    const response = await addMemberToGroup(
      client,
      req.body.GroupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: "User Added Successfully",
      });
    else
      return res.send({
        status: false,
        message: response.message,
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/remove-group-member", async (req, res) => {
  try {
    if (!req.body.GroupName && !req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }

    const response = await removeMemberFromGroup(
      client,
      req.body.GroupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: "User Removed Successfully",
      });
    else {
      if (
        response.message.includes(`expected at least 1 children, but found 0`)
      )
        return res.send({
          status: false,
          message: `Member ${req.body.UserNumber} not found in the Group ${req.body.GroupName}`,
        });

      return res.send({
        status: false,
        message: response.message,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/remove-from-community", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }

    const response = await RemoveMemberFromCommunity(
      client,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: "User Removed Successfully",
      });
    else {
      if (
        response.message.includes(`expected at least 1 children, but found 0`)
      )
        return res.send({
          status: false,
          message: `Member ${req.body.UserNumber} not found in the Community `,
        });

      return res.send({
        status: false,
        message: response.message,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/remove-messages-from-group", async (req, res) => {
  try {
    if (!req.body.UserNumber || !req.body.GroupName || !req.body.Time)
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    console.log(req.body);
    const response = await deleteMessagesFromGroupName(
      client,
      req.body.GroupName,
      req.body.UserNumber,
      req.body.Time
    );
    if (response.status)
      return res.send({
        status: true,
        message: response.message,
      });
    else
      return res.send({
        status: false,
        message: response.message,
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/remove-messages-from-community", async (req, res) => {
  try {
    if (!req.body.UserNumber || !req.body.Time)
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    console.log(req.body);
    const response = await deleteMessagesFromCommunity(
      client,
      req.body.UserNumber,
      req.body.Time
    );
    if (response.status)
      return res.send({
        status: true,
        message: response.message,
      });
    else
      return res.send({
        status: false,
        message: response.message,
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.get("/bot-status", async (req, res) => {
  if (check_status() == true)
    return res.send({
      success: true,
      status: "connected",
    });
  else
    return res.send({
      success: false,
      status: "disconnected",
    });
});

app.get("/get-qr", async (req, res) => {
  // Replace with actual QR code generation logic
  const qrString = get_qr();

  if (qrString != "") {
    const qrImage = qr.imageSync(qrString, { type: "png" });
    const base64Image = Buffer.from(qrImage).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;
    return res.send({
      success: true,
      qr: dataUrl,
    });
  } else
    return res.send({
      success: false,
      qr: "",
    });
});

app.post("/add-intern", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }
    const groupName = process.env.INTERN_GROUP;
    const response = await addMemberToGroup(
      client,
      groupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: response.message,
      });
    else
      return res.send({
        status: false,
        message: response.message,
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/add-training-intern", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }
    const groupName = process.env.TRAINING_GROUP;
    const response = await addMemberToGroup(
      client,
      groupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: response.message,
      });
    else
      return res.send({
        status: false,
        message: response.message,
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});
app.post("/add-interview", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }
    const groupName = process.env.INTERVIEW_GROUP;
    const response = await addMemberToGroup(
      client,
      groupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: response.message,
      });
    else
      return res.send({
        status: false,
        message: response.message,
      });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});
app.post("/remove-interview", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }
    const groupName = process.env.INTERVIEW_GROUP;
    const response = await removeMemberFromGroup(
      client,
      groupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: "User Removed Successfully",
      });
    else {
      if (
        response.message.includes(`expected at least 1 children, but found 0`)
      )
        return res.send({
          status: false,
          message: `Member ${req.body.UserNumber} not found in the Group ${req.body.GroupName}`,
        });

      return res.send({
        status: false,
        message: response.message,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

app.post("/remove-intern", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }
    const groupName = process.env.INTERN_GROUP;
    const response = await removeMemberFromGroup(
      client,
      groupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: "User Removed Successfully",
      });
    else {
      if (
        response.message.includes(`expected at least 1 children, but found 0`)
      )
        return res.send({
          status: false,
          message: `Member ${req.body.UserNumber} not found in the Group ${req.body.GroupName}`,
        });

      return res.send({
        status: false,
        message: response.message,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});
app.post("/remove-training-intern", async (req, res) => {
  try {
    if (!req.body.UserNumber) {
      return res.send({
        status: false,
        message: "Invalid Parameters",
      });
    }
    const groupName = process.env.TRAINING_GROUP;
    const response = await removeMemberFromGroup(
      client,
      groupName,
      req.body.UserNumber
    );
    if (response.status)
      return res.send({
        status: true,
        message: "User Removed Successfully",
      });
    else {
      if (
        response.message.includes(`expected at least 1 children, but found 0`)
      )
        return res.send({
          status: false,
          message: `Member ${req.body.UserNumber} not found in the Group ${req.body.GroupName}`,
        });

      return res.send({
        status: false,
        message: response.message,
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
});

module.exports = app;
