import { Jellyfish } from "./core/jellyfish";
import database from "./database/database";
import chalk from "chalk";

database();

Jellyfish.singleInsertById("98659")
  .then((data) => {
    if (data._id) {
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
