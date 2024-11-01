import { config } from "dotenv"
import { connect } from "mongoose"
import { colorize_error, colorize_mark } from "../utils/colorize"

config()
let cachedConnection: any = false
const URI: string | undefined = process.env.MONGODB_URI

async function database() {
  if (cachedConnection) {
    colorize_mark(`[database] Using cached connection.`)
    return cachedConnection
  }

  if (URI) {
    try {
      const connection = await connect(URI)
      if (connection) {
        cachedConnection = connection
        colorize_mark(`[database] ${connection.connection.port}`)
      } else {
        colorize_error(`[database] Connection failed.`)
      }
    } catch (error) {
      colorize_error(String(error))
    }
  } else {
    colorize_error(
      `[database] MONGODB_URI not provided as environment variable.`,
    )
  }
}

export default database
