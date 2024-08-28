import { Jellyfish } from "../core/jellyfish";
import database from "../database/database";
import { colorize_info, colorize_mark2 } from "../utils/colorize";
import { sendMail } from "../utils/workers";
import express from "express";

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.status(200).json({ status: 200 });
});
app.get("/update", async (req, res) => {
  await update();
  res.status(200).json({ status: 200 });
});
app.get("/update-all-dubs", async (req, res) => {
  await update_dubs();
  res.status(200).json({ status: 200, message: `updated` });
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
        if (process.env.NODEMAILER) {
          sendMail(`${count}`);
        } else {
          colorize_info(`environment variable not found.`);
        }
      } else {
        if (process.env.NODEMAILER) {
          sendMail("0");
        } else {
          colorize_info(`environment variable not found.`);
        }
      }
    })
    .catch((error) => {
      sendMail("0", String(error));
    });
}

async function update_dubs() {
  await database();
  await Jellyfish.updateAllDubs()
    .then((count) => {
      sendMail(String(count?.updated));
    })
    .catch((error) => {
      sendMail("0", String(error));
    });
}
