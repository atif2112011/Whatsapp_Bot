const express = require("express");
// const wsclient = require("./bot");
require("dotenv").config();
const app = express();
const bot = require("./bot");
const BotRoutes = require("./routes");
const path = require("path");
const PORT = process.env.PORT || 8000;

bot.Startbot();
app.use("/status", express.static(path.join(__dirname, "frontend")));
app.use(express.json());
app.use(BotRoutes);
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
