#!/usr/bin/env node
import arg from "arg";
import { Jellyfish } from "./core/jellyfish";
import {
  colorize_success,
  colorize_error,
  colorize_info,
} from "./utils/colorize";
import database from "./database/database";

try {
  database();
  const args = arg({
    "--i1": String,
    "--iall": Number,
    "--r1": Number,
    "--u0": Boolean,
    "--ud": String,
    "--stats": Boolean,
  });
  if (args["--i1"]) {
    Jellyfish.singleInsertById(args["--i1"])
      .then((data) => {
        if (data?._id) {
          colorize_success(
            `[${data?.title?.english}] [${data?._id}] inserted.`
          );
        }
        process.exit(0);
      })
      .catch((error) => {
        colorize_error(error);
        process.exit(0);
      });
  } else if (args["--iall"]) {
    Jellyfish.insertAllAnimes(args["--iall"])
      .then((data) => {
        colorize_success(data);
        process.exit(0);
      })
      .catch((error) => {
        colorize_error(error);
        process.exit(0);
      });
  } else if (args["--r1"]) {
    Jellyfish.deleteByAnilistId(args["--r1"])
      .then((data) => {
        if (data) {
          colorize_success(`[${args["--r1"]}] deleted successfully.`);
          process.exit(0);
        } else {
          colorize_error(`[${args["--r1"]}] somethings wrong.`);
          process.exit(0);
        }
      })
      .catch((error) => {
        colorize_error(error);
      });
  } else if (args["--u0"]) {
    Jellyfish.updateAllOngoing()
      .then((count) => {
        colorize_success(`[u0] ${count} updated.`);
        process.exit(0);
      })
      .catch((error) => {
        colorize_error(error);
        process.exit(0);
      });
  } else if (args["--ud"]) {
    Jellyfish.updateDubEpisodesById(args["--ud"])
      .then((data) => {
        colorize_info(`${data}`);
        process.exit(0);
      })
      .catch((error) => {
        colorize_error(error);
        process.exit(0);
      });
  } else if (args["--stats"]) {
    Jellyfish.getStats()
      .then((data) => {
        colorize_success(`Total Anime: ${data?.total_anime}`);
        process.exit(0);
      })
      .catch((error) => {
        colorize_error(error);
        process.exit(0);
      });
  }
} catch (error) {
  colorize_error(String(error));
}
