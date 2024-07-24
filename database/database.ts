import { config } from "dotenv";
import { connect } from "mongoose";
import { colorize_error, colorize_mark } from "../utils/colorize";

config();
const URI = process.env.MONGODB_URI;

async function database() {
  if (URI) {
    try {
      const connection = await connect(URI);
      if (connection) {
        colorize_mark(`[database] ${connection.connection.port}`);
      } else {
        colorize_error(`[database] error`);
      }
    } catch (error) {
      colorize_error(String(error));
    }
  } else {
    colorize_error(
      `[database] MONGODB_URI not provided as environment variable.`
    );
  }
}

export default database;
