import { config } from "dotenv";
import { colorize_error, colorize_info } from "./colorize";
import nodemailer from "nodemailer";

config({ path: "../.env" });
const NODEMAILER = process.env.NODEMAILER;

function replaceMultipleHyphens(text: string) {
  return text.replace(/-{2,}/g, "-");
}

function getCurrentDateAndTime() {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day}/${month}/${year} at ${formattedHours}:${minutes}${ampm}`;
}

async function sendMail(count: string, error?: string) {
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
    subject: "Update ongoing feedback from Jellyfish. 🍀",
    html: `Hello! 👋
    <br><br>
    Update ongoing is completed at ${getCurrentDateAndTime()}</b>.
    <br><br>
    ${error ? error : `<b>Total ${count} episodes added.</b>`}
    <br><br>
    In the meantime feel free to subscribe my <a href='https://youtube.com/@irfanshadikrishad'>youtube</a> channel.`,
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
