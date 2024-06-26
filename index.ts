import { Jellyfish } from "./core/jellyfish";
import database from "./database/database";
import chalk from "chalk";

database();

Jellyfish.singleInsertById("131930")
  .then((data) => {
    if (data && data._id) {
      console.log(
        chalk.green(
          `[singleInsertById] ${data.anilistId} ${data._id} ${
            data.title.english && data.title.english
          }`
        )
      );
    }
  })
  .catch((error) => {
    console.log(chalk.magenta(error));
  });
