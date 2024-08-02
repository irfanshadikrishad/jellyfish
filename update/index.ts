import { Jellyfish } from "../core/jellyfish";
import database from "../database/database";
import { colorize_info, colorize_mark2 } from "../utils/colorize";
import { sendMail, getRemainingTime } from "../utils/workers";
import express from "express";

const app = express();
const port = process.env.PORT || 3001;
let lastExecutionTime = Date.now();

colorize_info(`running.`);
setInterval(async () => {
  try {
    await update();
    lastExecutionTime = Date.now();
  } catch (error) {
    sendMail("0", String(error));
  }
}, 10800000); // Runs every 3hrs

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: 200, updateIn: getRemainingTime(lastExecutionTime) });
});

app.get("/update", async (req, res) => {
  await update();
  res.status(200).json({ status: 200 });
});

app.listen(port, () => {
  console.log(`[server] ${port}`);
});

async function update() {
  colorize_info(`Initiating ongoing updates...`);
  await database();
  await Jellyfish.updateAllOngoing()
    .then((count) => {
      if (count) {
        colorize_mark2(`[update] +${count} episodes.`);
        sendMail(`${count}`);
      } else {
        sendMail("0");
      }
    })
    .catch((error) => {
      sendMail("0", String(error));
    });
}
