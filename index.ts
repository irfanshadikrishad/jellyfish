import { Jellyfish } from "./core/jellyfish";
import database from "./database/database";
import {
  colorize_error,
  colorize_info,
  colorize_success,
} from "./utils/colorize";

database();

// Jellyfish.updateDubEpisodesById("5680")
//   .then((data) => {
//     colorize_info(`${data}`);
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });

// Jellyfish.updateAllOngoing()
//   .then((count) => {
//     colorize_success(`[updateAllOngoing] ${count} updated`);
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });

// Jellyfish.singleInsertById("142826")
//   .then((data) => {
//     if (data?._id) {
//       colorize_success(`[${data?.title?.english}] [${data?._id}] inserted.`);
//     }
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });

// Jellyfish.deleteByAnilistId(153288)
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });

// Jellyfish.insertBasedOnRange(50, 100)
//   .then((data) => {
//     colorize_success(`[insertBasedOnRange] ${data}`);
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });

Jellyfish.insertAllAnimes()
  .then((data) => {
    colorize_success(data);
  })
  .catch((error) => {
    colorize_error(error);
  });
