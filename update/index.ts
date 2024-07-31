import { Jellyfish } from "../core/jellyfish";
import database from "../database/database";
import { colorize_mark2 } from "../utils/colorize";
import { sendMail } from "../utils/workers";

setInterval(async () => {
  try {
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
  } catch (error) {
    sendMail("0", String(error));
  }
}, 10800000); // Runs every 3hrs
