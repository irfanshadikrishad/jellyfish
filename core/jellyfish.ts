import { META, ANIME } from "@consumet/extensions";
import Anime from "../schema/anime";
import fetch from "node-fetch";
import * as fs from "fs";

const anilist = new META.Anilist();
const gogoanime = new ANIME.Gogoanime();

import {
  colorize_error,
  colorize_info,
  colorize_success,
} from "../utils/colorize";
import { replaceMultipleHyphens } from "../utils/workers";

class Jellyfish {
  /**
   * Inserts single Anime by Anilist ID.
   * @param {string} anilistId - Anilist ID.
   * @returns {Promise<any>} The result of the save operation or error.
   */
  static async singleInsertById(anilistId: string): Promise<any> {
    const isAlreadyAdded = await Anime.findOne({ anilistId });
    if (anilistId && !isAlreadyAdded) {
      colorize_info(`[${anilistId}] initiated...`);
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
        recommendations?.forEach((r) => {
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
        colorize_success(
          `[recommendation] [${anilistId}] ${recommendModified.length}`
        );

        // GET GOGOID > GOGO_EPISODES > GOGO_EPISODE_SOURCES
        let gogo_subId: string | undefined = episodes?.[0]?.id
          ? String(episodes[0].id).split("-").slice(0, -2).join("-")
          : undefined;
        // If dub is included, remove it for sub
        if (gogo_subId && gogo_subId.includes("-dub")) {
          gogo_subId = gogo_subId.split("-dub").slice(0, -1).join("");
        }
        const gogo_dubId: string = replaceMultipleHyphens(`${gogo_subId}-dub`);
        colorize_info(`[subId] : ${gogo_subId}`);
        colorize_info(`[dubId] : ${gogo_dubId}`);
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
                  colorize_info(`[sub] [${anilistId}] ${epes.id}`);
                  try {
                    // const sources = await anilist.fetchEpisodeSources(epes.id);
                    const episode_information = {
                      id: epes.id,
                      number: epes.number,
                      title: epes.title ? epes.title : null,
                      // sources: sources,
                    };
                    return episode_information;
                  } catch (error) {
                    colorize_error(`[sub] ${epes.id}: ${error}`);
                    // Return an object indicating an error
                    return {
                      id: epes.id,
                      number: epes.number,
                      title: epes.title ? epes.title : null,
                      sources: [],
                      error: true,
                    };
                  }
                })
              );
            }
          } catch (error) {
            colorize_error(`[sub] not found`);
          }
        }
        colorize_success(`[sub] [${anilistId}] ${sub_episodes.length}`);

        try {
          // GET DUB EPISODES
          if (gogo_dubId) {
            const gogo_Info = await gogoanime.fetchAnimeInfo(gogo_dubId);
            const gogo_dubEpisodes = gogo_Info?.episodes;

            // Get episode sources with error handling
            if (gogo_Info && gogo_dubEpisodes) {
              dub_episodes = await Promise.all(
                gogo_dubEpisodes.map(async (epes, index) => {
                  colorize_info(`[dub] [${anilistId}] ${epes.id}`);
                  try {
                    // const sources = await anilist.fetchEpisodeSources(epes.id);
                    const episode_information = {
                      id: epes.id,
                      number: epes.number,
                      title: epes.title ? epes.title : null,
                      // sources: sources,
                    };
                    return episode_information;
                  } catch (error) {
                    colorize_error(`[dub] ${epes.id}: ${error}`);
                    // Return an object indicating an error
                    return {
                      id: epes.id,
                      number: epes.number,
                      title: epes.title ? epes.title : null,
                      sources: [],
                      error: true,
                    };
                  }
                })
              );
            }
          }
          colorize_success(`[dub] [${anilistId}] ${dub_episodes.length}`);
        } catch (error) {
          colorize_error(`[dub] not found`);
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

        if (sub_episodes.length === 0) {
          colorize_error(
            `[sub] ${sub_episodes.length} episodes. aborting insertion...`
          );
        } else {
          const saved_Anime = await anime.save();
          if (saved_Anime) {
            colorize_success(
              `[${
                saved_Anime?.title?.english
                  ? saved_Anime?.title?.english
                  : saved_Anime?.title?.romaji
              }] [${saved_Anime.anilistId}] inserted.`
            );
            return saved_Anime;
          } else {
            colorize_error(`[${anilistId}] save error`);
          }
        }
      } catch (error) {
        colorize_error(`[${anilistId}] not found`);
      }
    } else {
      colorize_success(
        `[${
          isAlreadyAdded?.title?.english
            ? isAlreadyAdded?.title?.english
            : isAlreadyAdded?.title?.romaji
        }] [${isAlreadyAdded?.anilistId}] [${
          isAlreadyAdded?._id
        }] already added.`
      );
      return `[${isAlreadyAdded?.title?.english}] already added.`;
    }
  }

  /**
   * returns anilist access token
   * @param {number} start - to start from
   * @param {number} end - to end from
   * @returns {any[]} array of added anilistId
   *  */
  static async insertBasedOnRange(start: number, end: number): Promise<any> {
    let added = [];
    for (let index = start; index <= end; index++) {
      try {
        colorize_info(`[insertBasedOnRange] getting ${index}`);
        const check = await this.singleInsertById(String(index));
        if (check && check._id) {
          added.push(check.anilistId);
        }
      } catch (error) {
        colorize_error(`[insertBasedOnRange] ${error}`);
      }
    }
    if (added.length > 0) {
      return added;
    } else {
      return `0 added`;
    }
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
        return del.acknowledged;
      } else {
        colorize_error(del);
      }
    } catch (error) {
      new Error(`[deleteByAnilistId] ${error}`);
    }
  }

  /**
   * Update All Ongoing Animes
   * @returns {Promise<any>} total updated count
   * Dub may not be updated on last few episodes if after status changes to completed after sub release
   */
  static async updateAllOngoing(): Promise<any> {
    try {
      let updatedTotal = 0;
      const getAllOngoingAnimes = await Anime.find({ status: "Ongoing" });
      colorize_success(
        `[u0] ${getAllOngoingAnimes.length} ongoing anime found.`
      );

      // Now need to traverse over all ongoing and check if it's outdated
      for (const ongoing of getAllOngoingAnimes) {
        // Getting gogoSubId && gogoDubId
        let gogoSubId = ongoing?.sub_episodes[0]?.id;
        let gogoDubIdParts = String(ongoing?.sub_episodes[0]?.id).split(
          "-episode-"
        );
        gogoSubId = String(gogoSubId).split("-episode-")[0];
        let gogoDubId = `${gogoDubIdParts[0]}-dub`;

        // Now that we have subId and dubId, let's get info from gogoanime
        if (gogoSubId) {
          try {
            const gogoSubInfo = await gogoanime.fetchAnimeInfo(gogoSubId);
            const latestEpisodes = gogoSubInfo?.episodes;
            const alreadyAddedEpisodes = ongoing?.sub_episodes;

            if (latestEpisodes?.length !== alreadyAddedEpisodes.length) {
              const storin = await Anime.findByIdAndUpdate(
                {
                  _id: ongoing._id,
                },
                { sub_episodes: latestEpisodes },
                { new: true }
              );
              if (storin) {
                updatedTotal++;
                colorize_info(
                  `[u0] [sub] [${ongoing.anilistId}] +${
                    latestEpisodes &&
                    latestEpisodes?.length - alreadyAddedEpisodes?.length
                  } episodes.`
                );
              }
            } else {
              colorize_info(`[u0] [sub] [${ongoing.anilistId}] up-to-date`);
            }
          } catch (error) {
            colorize_error(`[u0] [sub] [${ongoing.anilistId}] ${error}`);
          }
        }
        if (gogoDubId) {
          try {
            const gogoDubInfo = await gogoanime.fetchAnimeInfo(gogoDubId);
            const latestEpisodes = gogoDubInfo?.episodes;
            const alreadyAddedEpisodes = ongoing?.dub_episodes;

            if (latestEpisodes?.length !== alreadyAddedEpisodes.length) {
              const storin = await Anime.findByIdAndUpdate(
                {
                  _id: ongoing._id,
                },
                { dub_episodes: latestEpisodes },
                { new: true }
              );
              if (storin) {
                updatedTotal++;
                colorize_info(
                  `[u0] [dub] [${ongoing.anilistId}] +${
                    latestEpisodes &&
                    latestEpisodes?.length - alreadyAddedEpisodes?.length
                  } episodes.`
                );
              }
            } else {
              colorize_info(`[u0] [dub] [${ongoing.anilistId}] up-to-date`);
            }
          } catch (error) {
            colorize_error(
              `[u0] [dub] [${ongoing.anilistId}] no-dubs-available`
            );
          }
        }
      }
      return updatedTotal;
    } catch (error) {
      colorize_error(String(error));
    }
  }

  /**
   * To update Dub episodes of anime
   * @param {string} anilistId
   * @returns {string} update information
   */
  static async updateDubEpisodesById(
    anilistId: string
  ): Promise<string | undefined> {
    try {
      // Lets give an info about work
      colorize_info(`[ud] Initiating... [${anilistId}]`);
      // First of all let's check if the anime by this anilist id is in our database or not
      const isExist = await Anime.findOne({ anilistId });
      if (isExist) {
        // Now that we know it exists we have to get the dub episodes from gogoanime
        // But we dont know have dub id, so lets get the sub id and change to dub
        const gogoSubId = isExist.sub_episodes[0]?.id;
        const gogoDubId = `${String(gogoSubId)
          .split("-")
          .slice(0, -2)
          .join("-")}-dub`;
        const dubloon = await gogoanime.fetchAnimeInfo(gogoDubId);
        // Lets check if the request is successful, and episodes exists for corresponding anime
        if (dubloon && dubloon.episodes) {
          const alreadyHaveEpisodes = isExist.dub_episodes;
          const newEpisodesFromGogo = dubloon.episodes;
          // lets check if the episodes count the same, if not, update it
          if (alreadyHaveEpisodes.length < newEpisodesFromGogo.length) {
            // update
            const update = await Anime.findByIdAndUpdate(
              { _id: isExist._id },
              { dub_episodes: newEpisodesFromGogo },
              { new: true }
            );
            if (update) {
              return `[ud] [${isExist.anilistId}] +${
                newEpisodesFromGogo.length - alreadyHaveEpisodes.length
              } episodes`;
            }
          } else {
            return `[${anilistId}] already up-to-date`;
          }
        } else {
          return `[${anilistId}] no dub found for ${
            isExist.title?.english
              ? isExist?.title?.english
              : isExist?.title?.romaji
          }`;
        }
      } else {
        return `[ud] [${anilistId}] does not exist in database`;
      }
    } catch (error) {
      colorize_error(`${error}`);
      throw new Error(`error from u0: ${error}`);
    }
  }

  /**
   * Insert all animes
   * @param {number} from page number
   * @returns {any}
   */
  static async insertAllAnimes(from: number): Promise<any> {
    let loop = true;
    let request_Count = 0;
    const url = "https://graphql.anilist.co";
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME) {
            id
          }
        }
      }
    `;
    let variables = { page: from, perPage: 1 };

    while (loop) {
      const request = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      const response = (await request.json()) as {
        data?: {
          Page: {
            pageInfo: {
              total: number;
              currentPage: number;
              lastPage: number;
              hasNextPage: boolean;
              perPage: number;
            };
            media: {
              id: number;
            }[];
          };
        };
        errors?: any[];
      };

      if (response.errors) {
        console.error("Error in response:", response.errors);
        break;
      } else {
        for (const anime of response?.data?.Page?.media || []) {
          try {
            // colorize_info(`${String(anime?.id)}, ${request_Count}`);
            await this.singleInsertById(String(anime.id));

            if (response.data?.Page.pageInfo.hasNextPage) {
              variables.page += 1;
            } else {
              loop = false;
              return `[] inserted successfully.`;
            }
          } catch (error) {
            colorize_error(String(error));
            if (response.data?.Page.pageInfo.hasNextPage) {
              variables.page += 1;
            } else {
              loop = false;
              return `[] inserted successfully.`;
            }
          }
        }

        request_Count++;
        // Counter to bypass rate-limit
        if (request_Count >= 1) {
          colorize_info(`Interval initiated...`);
          await new Promise((resolve) => setTimeout(resolve, 10000));
          request_Count = 0;
          colorize_info(
            `Interval reset... [${variables.page}/${response?.data?.Page?.pageInfo?.total}]`
          );
          // SAVE THE LAST INSERTED PAGE NUMBER, IN CASE OF EMERGENCIES
          fs.writeFile("lastInserted.txt", `${variables.page}`, (err) => {
            if (err) {
              colorize_error(`${err}`);
            }
          });
        }
      }
    }
  }

  /**
   * removes anime with 0 episodes
   */
  static async removeZero() {
    try {
      const rmv = await Anime.deleteMany({ sub_episodes: { $size: 0 } });
      if (rmv) {
        return rmv;
      } else {
        colorize_error(`something wrong in removeZero`);
      }
    } catch (error) {
      return error;
    }
  }

  /**
   * To get the statistics from database
   * @returns {Promise<any>} stats
   */
  static async getStats(): Promise<any> {
    try {
      const total_Anime = await Anime.find({});
      return { total_anime: total_Anime.length };
    } catch (error) {
      throw new Error(`Error getting stats.`);
    }
  }
}

export { Jellyfish };
