import { config } from "dotenv";
import { colorize_error } from "./colorize";
import nodemailer from "nodemailer";

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
        : `<b>Total ${count} episodes added in ${
            updatedAnimes ? updatedAnimes?.length : 0
          } anime(s).</b><br><br>`
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
        : `[updatedAnimes] ${count} updated animes 😥`
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

/**
 * Get the default title from title object
 * @param title { english?: string; romaji?: string; native?: string; userPreffered?: string;}
 * @returns single title as string
 */
function getTitle(title?: {
  english?: string;
  romaji?: string;
  native?: string;
  userPreferred?: string;
}): string {
  if (title?.english) {
    return title.english;
  } else if (title?.romaji) {
    return title.romaji;
  } else if (title?.native) {
    return title.native;
  } else if (title?.userPreferred) {
    return title.userPreferred;
  } else {
    return "null";
  }
}

function getCurrentDateAndTime() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
    ,
    { value: hour },
    ,
    { value: minute },
    ,
    { value: period },
  ] = formatter.formatToParts(now);

  return `${day}/${month}/${year} at ${hour}:${minute}${period}`;
}

function replaceMultipleHyphens(text: string) {
  return text.replace(/-{2,}/g, "-");
}

function getGogoIDFromEpisodeId(episodeID: string) {
  if (!episodeID) {
    return "";
  } else {
    let gogoID: string = episodeID.split("-episode-")[0];
    return gogoID;
  }
}

export {
  getTitle,
  getCurrentDateAndTime,
  replaceMultipleHyphens,
  getGogoIDFromEpisodeId,
  sendMail,
};
