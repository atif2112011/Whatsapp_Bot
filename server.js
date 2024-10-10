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

app.get('/ping',(req,res)=>{
  try {
    return res.send("Keep Alive Request Success");
  } catch (error) {
    return res.send(error.message)
  }
})

//CRON
// Ping the server every 25 minutes (300,000 ms)
setInterval(() => {
  axios.get('https://your-render-app-url/ping')
      .then(response => console.log('Keep-alive request successful'))
      .catch(error => console.log('Error sending keep-alive request:', error));
}, 1500000); // 5 minutes in milliseconds

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
