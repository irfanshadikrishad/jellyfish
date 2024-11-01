import { colorize_info, colorize_mark5 } from "./colorize"

const usage = () => {
  colorize_info(``)
  colorize_mark5(`Jellyfish available commands:\n`)
  colorize_info(`--i1 [anilistId]       • Insert anime by anilistId.`)
  colorize_info(`--iall                 • Insert all animes.`)
  colorize_info(`--iname [anime_name]   • Insert all animes.`)
  colorize_info(`--r0                   • Remove animes with zero episode.`)
  colorize_info(`--r1 [anilistId]       • Remove anime by anilistId.`)
  colorize_info(`--u0                   • Update all ongoing animes.`)
  colorize_info(`--ud [anilistId]       • Update dub episodes by anilistId.`)
  colorize_info(`--udall                • Update all dubs from database.`)
  colorize_info(`--us                   • Update season.`)
  colorize_info(`--stats                • Get statistics from database.`)
  colorize_info(`--help | -h            • Get the available commands.`)
}

export { usage }
