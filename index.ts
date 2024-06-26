import { Jellyfish } from "./core/jellyfish";
import database from "./database/database";
import chalk from "chalk";

database();

Jellyfish.singleInsertById("21087")
  .then((data) => {
    if (data) {
      console.log(chalk.green(`[singleInsertById] ${data.anilistId}`));
    }
  })
  .catch((error) => {
    console.log(error);
  });
