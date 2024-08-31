#!/usr/bin/env node
import arg from "arg";
import database from "./database/database";
import { Jellyfish } from "./core/jellyfish";
import {
  colorize_success,
  colorize_error,
  colorize_mark,
  colorize_mark2,
  colorize_info,
} from "./utils/colorize";
import { usage } from "./utils/usage";
const {
  singleInsertById,
  insertAllAnimes,
  insertAllByName,
  deleteByAnilistId,
  updateAllOngoing,
  updateDubEpisodesById,
  getStats,
  remove_Zero,
  remove_nextAiringEpisode,
  updateAllDubs,
  distinct,
  updateSeason,
} = Jellyfish;

try {
  const args = arg({
    "--i1": String,
    "--iall": Number,
    "--iname": String,
    "--r1": Number,
    "--r0": Boolean,
    "--rair": Boolean,
    "--u0": Boolean,
    "--ud": String,
    "--udall": Number,
    "--stats": Boolean,
    "--subId": String,
    "--dubId": String,
    "--distinct": Boolean,
    "--us": Boolean,
  });
  if (args["--i1"]) {
    await database();
    await singleInsertById(
      args["--i1"],
      args["--subId"] && args["--subId"],
      args["--dubId"] && args["--dubId"]
    )
      .then((data) => {
        if (data?._id) {
          colorize_mark2(
            `\n[${
              data?.title?.english ? data?.title?.english : data?.title?.romaji
            }] [${data?.sub_episodes?.length}/${data?.dub_episodes?.length}/${
              data?.totalEpisodes
            }] inserted.`
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
        colorize_mark2(data);
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
          colorize_mark2(`\n[${args["--r1"]}] deleted successfully.`);
        } else {
          colorize_error(`\n[${args["--r1"]}] somethings went wrong.`);
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
          colorize_mark2(`\n[u0] ${count} episodes added.`);
        } else {
          colorize_mark2(`\n[u0] 0 episodes added.`);
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
        colorize_mark2(`\n${data}`);
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
          status_ongoing,
          // status_completed,
          // status_hiatus,
          // status_cancelled,
          // status_notYetAired,
          // status_unknown,
          format_TV,
          format_TV_Short,
          format_Movie,
          format_Special,
          format_OVA,
          format_ONA,
          // format_Music,
          // format_Manga,
          // format_Novel,
          // format_Oneshot,
          origin_japan,
          origin_southKorea,
          origin_china,
          total_adult,
        }) => {
          colorize_mark(`\nJellyfish`);
          colorize_success(`Anime:      ${total_anime}`);
          colorize_success(`Ongoing:    ${status_ongoing}`);
          // colorize_success(`Completed:  ${status_completed}`);
          // colorize_success(`Hiatus:     ${status_hiatus}`);
          // colorize_success(`Cancelled:  ${status_cancelled}`);
          // colorize_success(`Upcoming:   ${status_notYetAired}`);
          // colorize_success(`Unknown:    ${status_unknown}`);
          colorize_success(`TV:         ${format_TV}`);
          colorize_success(`TV_SHORT:   ${format_TV_Short}`);
          colorize_success(`Movie:      ${format_Movie}`);
          colorize_success(`Special:    ${format_Special}`);
          colorize_success(`OVA:        ${format_OVA}`);
          colorize_success(`ONA:        ${format_ONA}`);
          // colorize_success(`Music:      ${format_Music}`);
          // colorize_success(`Manga:      ${format_Manga}`);
          // colorize_success(`Novel:      ${format_Novel}`);
          // colorize_success(`OneShot:    ${format_Oneshot}`);
          colorize_success(`Japan:      ${origin_japan}`);
          colorize_success(`Korea:      ${origin_southKorea}`);
          colorize_success(`China:      ${origin_china}`);
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
        colorize_mark2(`\n[r0] ${count} anime(s) deleted.`);
      })
      .catch((error) => {
        colorize_error(error);
      });
    process.exit(0);
  } else if (args["--iname"]) {
    await database();
    await insertAllByName(args["--iname"])
      .then((count) => {
        if (count) {
          colorize_mark2(`\n[iname] ${count} inserted.`);
        } else {
          colorize_mark2(`\n[iname] 0 inserted.`);
        }
      })
      .catch((error) => {
        colorize_error(`\n[iname] ${error}`);
      });
    process.exit(0);
  } else if (args["--rair"]) {
    colorize_info(`[rair] deprecated`);
    // await database();
    // await remove_nextAiringEpisode()
    //   .then((count) => {
    //     colorize_mark2(`\n[rair] ${count} deleted`);
    //   })
    //   .catch((err) => {
    //     colorize_error(`[rair] ${err}`);
    //   });
    // process.exit(0);
  } else if (args["--udall"]) {
    await database();
    await updateAllDubs(args["--udall"])
      .then((count) => {
        if (count) {
          colorize_mark2(`\nAnime Updated : ${count?.updated}`);
          colorize_mark2(`\nEpisodes added: ${count?.episodes_added}`);
        }
      })
      .catch((err) => {
        colorize_error(`${err.message}`);
      });
    process.exit(0);
  } else if (args["--distinct"]) {
    await database();
    await distinct()
      .then(() => {})
      .catch((error) => {
        colorize_error(`[distinct] ${error}`);
      });
    process.exit(0);
  } else if (args["--us"]) {
    await database();
    await updateSeason()
      .then((count) => {
        colorize_mark2(`\n${count} status changed.`);
      })
      .catch((err) => {
        colorize_error(`[us] ${err}`);
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
