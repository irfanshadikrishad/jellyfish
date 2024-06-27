import { META, ANIME } from "@consumet/extensions";
import chalk from "chalk";
import Anime from "../schema/anime";

const anilist = new META.Anilist();
const gogoanime = new ANIME.Gogoanime();

class Jellyfish {
  /**
   * Inserts single Anime by Anilist ID.
   * @param {string} anilistId - Anilist ID.
   * @returns {Promise<any>} The result of the save operation or error.
   */
  static async singleInsertById(anilistId: string): Promise<any> {
    const isAlreadyAdded = await Anime.findOne({ anilistId });
    if (anilistId && !isAlreadyAdded) {
      console.log(chalk.gray(`[singleInsertById] ${anilistId} initiated...`));
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
        } = await anilist.fetchAnimeInfo(anilistId, false);

        // MODIFY RECOMMENDATION AND STORE
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
        console.log(
          chalk.green(`[recommendation] ${recommendModified.length}`)
        );

        // GET GOGOID > GOGO_EPISODES > GOGO_EPISODE_SOURCES
        let gogo_subId: string | undefined = episodes?.[0]?.id
          ? String(episodes[0].id).split("-").slice(0, -2).join("-")
          : undefined;
        // If dub is included, remove it for sub
        if (gogo_subId && gogo_subId.includes("-dub")) {
          gogo_subId = gogo_subId.split("-dub").slice(0, -1).join("");
        }
        const gogo_dubId: string = gogo_subId + "-dub";
        console.log(chalk.gray(`[subId] : ${gogo_subId}`));
        console.log(chalk.gray(`[dubId] : ${gogo_dubId}`));
        // STORAGE
        let sub_episodes: any[] = [];
        let dub_episodes: any[] = [];

        // GET SUB EPISODES
        if (gogo_subId) {
          try {
            const gogo_Info = await gogoanime.fetchAnimeInfo(gogo_subId);
            const gogo_subEpisodes = gogo_Info?.episodes;

            // Get episode sources with error handling
            if (gogo_subEpisodes) {
              sub_episodes = await Promise.all(
                gogo_subEpisodes.map(async (epes, index) => {
                  console.log(chalk.gray(`[sub] eps id: ${epes.id}`));
                  try {
                    return await anilist.fetchEpisodeSources(epes.id);
                  } catch (error) {
                    console.log(
                      chalk.magenta(
                        `[sub] Episode source fetch error for episode ${epes.id}: ${error}`
                      )
                    );
                    // Return an empty array or a placeholder value to indicate an error
                    return []; // Or any placeholder value suitable for your logic
                  }
                })
              );
            }
          } catch (error) {
            console.log(chalk.magenta(`[sub] not found`));
          }
        }
        console.log(chalk.green(`[sub] ${sub_episodes.length}`));

        try {
          // GET DUB EPISODES
          if (gogo_dubId) {
            const gogo_Info = await gogoanime.fetchAnimeInfo(gogo_dubId);
            const gogo_dubEpisodes = gogo_Info?.episodes;

            // Get episode sources with error handling
            if (gogo_Info && gogo_dubEpisodes) {
              dub_episodes = await Promise.all(
                gogo_dubEpisodes.map(async (epes, index) => {
                  console.log(chalk.gray(`[dub] eps id: ${epes.id}`));
                  try {
                    return await anilist.fetchEpisodeSources(epes.id);
                  } catch (error) {
                    console.log(
                      chalk.magenta(
                        `[dub] Episode source fetch error for episode ${epes.id}: ${error}`
                      )
                    );
                    // Return an empty array or a placeholder value to indicate an error
                    return []; // Or any placeholder value suitable for your logic
                  }
                })
              );
            }
          }
          console.log(chalk.green(`[dub] ${dub_episodes.length}`));
        } catch (error) {
          console.log(chalk.magenta(`[dub] not found`));
        }

        // SAVE ANIME DETAILS TO THE DATABASE
        const anime = new Anime({
          anilistId: id,
          malId: malId,
          title: title,
          description: description,
          sub_episodes: sub_episodes,
          dub_episodes: dub_episodes,
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
        console.log(chalk.magenta(`[singleInsertById] ${anilistId} not found`));
      }
    } else {
      console.log(
        chalk.green(
          `anilistId: ${anilistId}, already exists: ${Boolean(isAlreadyAdded)}`
        )
      );
    }
  }

  /**
   * returns anilist access token
   * @param {number} start - to start from
   * @param {number} end - to end from
   * @returns {Promise<any>} access token
   *  */
  static async insertBasedOnRange(start: number, end: number): Promise<any> {
    let added = [];
    for (let index = start; index <= end; index++) {
      try {
        console.log(chalk.gray(`[insertBasedOnRange] getting ${index}`));
        const check = await this.singleInsertById(String(index));
        if (check && check._id) {
          added.push(check.anilistId);
        }
      } catch (error) {
        console.log(chalk.magenta(`[insertBasedOnRange] ${error}`));
      }
    }
    return added;
  }

  /**
   * returns if deleted or not
   * @param {number} anilistId
   * @returns {any}
   */
  static async deleteByAnilistId(anilistId: number): Promise<any> {
    try {
      const del = await Anime.deleteOne({ anilistId });
      if (del) {
        return del;
      } else {
        console.log(del);
      }
    } catch (error) {
      new Error(`[deleteByAnilistId] ${error}`);
    }
  }
}

export { Jellyfish };
