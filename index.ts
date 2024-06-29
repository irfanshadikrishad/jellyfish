import { Jellyfish } from "./core/jellyfish";
import database from "./database/database";
import {
  colorize_error,
  colorize_info,
  colorize_success,
} from "./utils/colorize";

database();

// Jellyfish.updateDubEpisodesById("21")
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

// Jellyfish.singleInsertById("52")
//   .then((data) => {
//     colorize_success(
//       `[singleInsertById] ${data._id} ${
//         data.title.english && data.title.english
//       }`
//     );
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

Jellyfish.insertBasedOnRange(50, 100)
  .then((data) => {
    colorize_success(`[insertBasedOnRange] ${data}`);
  })
  .catch((error) => {
    colorize_error(error);
  });
