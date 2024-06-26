import { META } from "@consumet/extensions";
import chalk from "chalk";
import Anime from "../schema/anime";

const anilist = new META.Anilist();

class Jellyfish {
  /**
   * Inserts single Anime by Anilist ID.
   * @param {string} anilistId - Anilist ID.
   * @returns {Promise<any>} The result of the save operation or error.
   */
  static async singleInsertById(anilistId: string): Promise<any> {
    const isAlreadyAdded = await Anime.findOne({ anilistId });
    if (anilistId && !isAlreadyAdded) {
      console.log(chalk.gray(`[singleInsertById] running`));
      try {
        const {
          title,
          description,
          id,
          malId,
          episodes,
          image,
          cover,
          countryOfOrigin,
          type,
          duration,
          totalEpisodes,
          startDate,
          endDate,
          status,
          synonyms,
          genres,
          isAdult,
          nextAiringEpisode,
          studios,
          recommendations,
        } = await anilist.fetchAnimeInfo(anilistId);

        const recommendModified: any[] = [];
        recommendations?.map((r) => {
          let insertRec = {
            animeId: r.id,
            malId: r.malId,
            title: r.title,
            status: r.status,
            episodes: r.episodes,
            poster: r.image,
            cover: r.cover,
            rating: r.rating,
            format: r.type,
          };
          recommendModified.push(insertRec);
        });

        // Fetching episodes asynchronously
        let unicorn_Episodes: any[] = [];
        if (episodes) {
          unicorn_Episodes = await Promise.all(
            episodes.map(async (epes, index) => {
              return await anilist.fetchEpisodeSources(epes.id);
            })
          );
        }

        const anime = new Anime({
          anilistId: id,
          malId: malId,
          title: title,
          description: description,
          episodes: unicorn_Episodes,
          poster: image,
          cover: cover,
          origin: countryOfOrigin,
          format: type,
          duration: duration,
          totalEpisodes: totalEpisodes,
          airing_start: startDate,
          airing_end: endDate,
          status: status,
          synonyms: synonyms,
          genres: genres,
          isAdult: isAdult,
          nextAiringEpisode: nextAiringEpisode,
          studios: studios,
          recommendations: recommendModified,
        });

        const saved_Anime = await anime.save();
        if (saved_Anime) {
          return saved_Anime;
        } else {
          console.log(chalk.magenta(`[singleInsertById] save error`));
        }
      } catch (error) {
        console.log(chalk.magenta(error));
      }
    } else {
      console.log(
        chalk.green(
          `anilistId: ${anilistId}, already exists: ${Boolean(isAlreadyAdded)}`
        )
      );
    }
  }
}

export { Jellyfish };
