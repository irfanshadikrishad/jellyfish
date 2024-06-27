import { Jellyfish } from "./core/jellyfish";
import database from "./database/database";
import {
  colorize_error,
  colorize_info,
  colorize_success,
} from "./utils/colorize";

database();

// Jellyfish.updateAllOngoing()
//   .then((count) => {
//     colorize_success(`[updateAllOngoing] ${count} updated`);
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });
// Jellyfish.singleInsertById("170890")
//   .then((data) => {
//     console.log(
//       chalk.green(
//         `[singleInsertById] ${data._id} ${
//           data.title.english && data.title.english
//         }`
//       )
//     );
//   })
//   .catch((error) => {
//     console.log(error);
//   });
// Jellyfish.deleteByAnilistId(153288)
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => {
//     colorize_error(error);
//   });
Jellyfish.insertBasedOnRange(0, 10)
  .then((data) => {
    colorize_success(`[insertBasedOnRange] ${data}`);
  })
  .catch((error) => {
    colorize_error(error);
  });
