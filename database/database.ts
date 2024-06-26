import { config } from "dotenv";
import chalk from "chalk";
import { connect } from "mongoose";

config();
const URI = process.env.MONGODB_URI;

async function database() {
  if (URI) {
    try {
      const connection = await connect(URI);
      if (connection) {
        console.log(chalk.cyan(`[database] ${connection.connection.port}`));
      } else {
        console.log(chalk.magenta(`[database] error`));
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default database;
