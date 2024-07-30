import { colorize_info } from "./colorize";

const usage = () => {
  colorize_info(``);
  colorize_info(`Usage:`);
  colorize_info(`--i1 [anilistId]       • Insert anime by anilistId.`);
  colorize_info(`--iall [from_page]     • Insert all animes.`);
  colorize_info(`--iname [anime_name]   • Insert all animes.`);
  colorize_info(`--r0                   • Remove animes with zero episode.`);
  colorize_info(`--r1 [anilistId]       • Remove anime by anilistId.`);
  colorize_info(`--u0                   • Update all ongoing animes.`);
  colorize_info(`--ud [anilistId]       • Update dub episodes by anilistId.`);
  colorize_info(`--stats                • Get statistics from database.`);
};

export { usage };
