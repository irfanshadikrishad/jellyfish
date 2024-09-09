import { config } from "dotenv";
import { colorize_error } from "./colorize";
import nodemailer from "nodemailer";
import { getTitle } from "./helpers";

config({ path: "../.env" });
const NODEMAILER = process.env.NODEMAILER;

function replaceMultipleHyphens(text: string) {
  return text.replace(/-{2,}/g, "-");
}

function getCurrentDateAndTime() {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day}/${month}/${year} at ${formattedHours}:${minutes}${ampm}`;
}

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

export { replaceMultipleHyphens, sendMail };
