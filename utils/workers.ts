import { config } from "dotenv";
import { colorize_error } from "./colorize";
import nodemailer from "nodemailer";
import { getTitle, getCurrentDateAndTime } from "./helpers";

config({ path: "../.env" });
const NODEMAILER = process.env.NODEMAILER;

async function sendMail(count: string, error?: string, updatedAnimes?: [any]) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: String(process.env.EMAIL_FROM),
      pass: String(NODEMAILER),
    },
  });

  var mailOptions = {
    from: `Jellyfish <${String(process.env.EMAIL_FROM)}>`,
    to: String(process.env.EMAIL_TO),
    subject: `Jellyfish — ${count} episodes added.`,
    html: `
    Hello! 👋
    <br><br>
    Update ongoing is completed at ${getCurrentDateAndTime()}.
    <br><br>
    ${
      error
        ? error
        : `<b>Total ${count} episodes added in ${updatedAnimes?.length} anime(s).</b><br><br>`
    }
    ${
      Number(count) > 0 && updatedAnimes && updatedAnimes?.length > 0
        ? updatedAnimes
            ?.map(
              ({ title, anilistId }, idx) =>
                `<a href="https://komachi-v2.vercel.app/watch/${anilistId}">${
                  idx + 1
                }. ${getTitle(title)}</a>`
            )
            .join("<br>")
        : `[updatedAnimes] 😥`
    }
    <br><br>
    In the meantime, feel free to subscribe to my <a href='https://youtube.com/@irfanshadikrishad'>YouTube</a> channel.
  `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      colorize_error(String(error));
    } else {
      console.log(info);
    }
  });
}

export { sendMail };
