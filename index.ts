#!/usr/bin/env node
import arg from "arg";
import database from "./database/database";
import { Jellyfish } from "./core/jellyfish";
import {
  colorize_success,
  colorize_error,
  colorize_mark,
} from "./utils/colorize";
import { usage } from "./utils/usage";
const {
  singleInsertById,
  insertAllAnimes,
  deleteByAnilistId,
  updateAllOngoing,
  updateDubEpisodesById,
  getStats,
  remove_Zero,
} = Jellyfish;

try {
  const args = arg({
    "--i1": String,
    "--iall": Number,
    "--r1": Number,
    "--r0": Boolean,
    "--u0": Boolean,
    "--ud": String,
    "--stats": Boolean,
  });
  if (args["--i1"]) {
    await database();
    await singleInsertById(args["--i1"])
      .then((data) => {
        if (data?._id) {
          colorize_success(
            `[${
              data?.title?.english ? data?.title?.english : data?.title?.romaji
            }] [${data?._id}] inserted.`
          );
        }
      })
      .catch((error) => {
        colorize_error(error);
      });
    process.exit(0);
  } else if (args["--iall"]) {
    await database();
    await insertAllAnimes(args["--iall"])
      .then((data) => {
        colorize_success(data);
      })
      .catch((error) => {
        colorize_error(error);
      });
    process.exit(0);
  } else if (args["--r1"]) {
    await database();
    await deleteByAnilistId(args["--r1"])
      .then((deleted) => {
        if (deleted) {
          colorize_success(`[${args["--r1"]}] deleted successfully.`);
        } else {
          colorize_error(`[${args["--r1"]}] somethings went wrong.`);
        }
      })
      .catch((error) => {
        colorize_error(String(error));
      });
    process.exit(0);
  } else if (args["--u0"]) {
    await database();
    await updateAllOngoing()
      .then((count) => {
        if (count) {
          colorize_success(`[u0] ${count} episodes added.`);
        } else {
          colorize_success(`[u0] 0 updated.`);
        }
      })
      .catch((error) => {
        colorize_error(String(error.message));
      });
    process.exit(0);
  } else if (args["--ud"]) {
    await database();
    await updateDubEpisodesById(args["--ud"])
      .then((data) => {
        colorize_success(`${data}`);
      })
      .catch((error) => {
        colorize_error(error);
      });
    process.exit(0);
  } else if (args["--stats"]) {
    await database();
    await getStats()
      .then(
        ({
          total_anime,
          // status_ongoing,
          // status_completed,
          // status_hiatus,
          // status_cancelled,
          // status_notYetAired,
          // status_unknown,
          // format_TV,
          // format_TV_Short,
          // format_Movie,
          // format_Special,
          // format_OVA,
          // format_ONA,
          // format_Music,
          // format_Manga,
          // format_Novel,
          // format_Oneshot,
          // origin_japan,
          total_adult,
        }) => {
          colorize_mark(`Jellyfish`);
          colorize_success(`Anime:      ${total_anime}`);
          // colorize_success(`Ongoing:    ${status_ongoing}`);
          // colorize_success(`Completed:  ${status_completed}`);
          // colorize_success(`Hiatus:     ${status_hiatus}`);
          // colorize_success(`Cancelled:  ${status_cancelled}`);
          // colorize_success(`Upcoming:   ${status_notYetAired}`);
          // colorize_success(`Unknown:    ${status_unknown}`);
          // colorize_success(`TV:         ${format_TV}`);
          // colorize_success(`TV_SHORT:   ${format_TV_Short}`);
          // colorize_success(`Movie:      ${format_Movie}`);
          // colorize_success(`Special:    ${format_Special}`);
          // colorize_success(`OVA:        ${format_OVA}`);
          // colorize_success(`ONA:        ${format_ONA}`);
          // colorize_success(`Music:      ${format_Music}`);
          // colorize_success(`Manga:      ${format_Manga}`);
          // colorize_success(`Novel:      ${format_Novel}`);
          // colorize_success(`OneShot:    ${format_Oneshot}`);
          // colorize_success(`Japan:      ${origin_japan}`);
          colorize_success(`Adult:      ${total_adult}`);
        }
      )
      .catch((error) => {
        colorize_error(error);
      });
    process.exit(0);
  } else if (args["--r0"]) {
    await database();
    await remove_Zero()
      .then((count) => {
        colorize_success(`[r0] ${count} anime(s) deleted.`);
      })
      .catch((error) => {
        colorize_error(error);
      });
    process.exit(0);
  } else {
    usage();
    process.exit(0);
  }
} catch (error) {
  colorize_error(String(error));
  usage();
  process.exit(0);
}
