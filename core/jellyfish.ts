import { META, ANIME } from "@consumet/extensions";
import chalk from "chalk";
import Anime from "../schema/anime";
import fetch from "node-fetch";

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
   * @returns {number} total updated count
   * Dub may not be updated on last few episodes if after status changes to completed after sub release
   */
  static async updateAllOngoing(): Promise<number> {
    try {
      // STEP-1: Finding out the animes that are ongoing
      const ongoing = await Anime.find({ status: "Ongoing" });
      colorize_info(`[updateAllOngoing] ${ongoing.length} found`);

      let updatedCount = 0; // Counter to track the number of updates

      // Traverse over it to access all individually
      const updatePromises = ongoing.map(async (ong_ing) => {
        try {
          let animeUpdated = false; // Flag to check if the anime was updated

          // AnilistId can be accessed from here now,
          // lets get the subId from first episodeId
          let gogo_subId: string | undefined = ong_ing.sub_episodes?.[0]?.id
            ? String(ong_ing.sub_episodes[0].id)
                .split("-")
                .slice(0, -2)
                .join("-")
            : undefined;

          // If dub is included, remove it for sub
          if (gogo_subId && gogo_subId.includes("-dub")) {
            gogo_subId = gogo_subId.split("-dub").slice(0, -1).join("");
          }
          const gogo_dubId: string = gogo_subId + "-dub";
          colorize_info(`[subId] : ${gogo_subId}`);
          colorize_info(`[dubId] : ${gogo_dubId}`);

          // Now that we got subId, dubId let fetch their episodes from gogoanime
          if (gogo_subId && gogo_dubId) {
            const gogoSubInfo =
              (await gogoanime.fetchAnimeInfo(gogo_subId)) || null;
            const gogoDubInfo =
              (await gogoanime.fetchAnimeInfo(gogo_dubId)) || null;
            // Storing episodes inside variables
            const gogoSubEpisodes = gogoSubInfo?.episodes;
            const gogoDubEpisodes = gogoDubInfo?.episodes;
            // These are the already added episodes
            const alreadyAddedSubEpisodes = ong_ing?.sub_episodes;
            const alreadyAddedDubEpisodes = ong_ing?.dub_episodes;

            if (gogoSubEpisodes) {
              const isSubSame =
                gogoSubEpisodes.length === alreadyAddedSubEpisodes.length;
              const isDubSame =
                gogoDubEpisodes?.length === alreadyAddedDubEpisodes.length;

              // If the lengths are the same means no recent updates
              if (!isSubSame) {
                const updatedGogoSubEpisodes = await Promise.all(
                  gogoSubEpisodes.map(async (g_e) => {
                    colorize_info(`[sub] ${g_e.id}`);
                    try {
                      const sources = await gogoanime.fetchEpisodeSources(
                        g_e.id
                      );
                      const episode_information = {
                        id: g_e.id,
                        number: g_e.number,
                        title: g_e.title ? g_e.title : null,
                        sources: sources,
                      };
                      return episode_information;
                    } catch (error) {
                      colorize_error(
                        `[updateAllOngoing] Error fetching sub episode sources for ${g_e.id}: ${error}`
                      );
                      return null;
                    }
                  })
                );

                // After getting new episodes, let's update to the database
                if (updatedGogoSubEpisodes) {
                  colorize_info(
                    `${ong_ing.anilistId} have : ${alreadyAddedSubEpisodes.length} found : ${updatedGogoSubEpisodes.length}`
                  );
                  const storin = await Anime.findByIdAndUpdate(
                    {
                      _id: ong_ing._id,
                    },
                    { sub_episodes: updatedGogoSubEpisodes },
                    { new: true }
                  );
                  if (storin) {
                    colorize_success(
                      `[updateAllOngoing] ${storin.anilistId} ${storin._id} sub updated`
                    );
                    animeUpdated = true; // Mark as updated
                  } else {
                    colorize_error(
                      `[updateAllOngoing] something wrong. ${storin}`
                    );
                  }
                }
              } else {
                colorize_info(`[sub] up-to-date`);
              }

              // Now let's check on the dub anime's
              if (!isDubSame && gogoDubEpisodes) {
                const updatedGogoDubEpisodes = await Promise.all(
                  gogoDubEpisodes.map(async (g_e) => {
                    try {
                      const sources = await gogoanime.fetchEpisodeSources(
                        g_e.id
                      );
                      const episode_information = {
                        id: g_e.id,
                        number: g_e.number,
                        title: g_e.title ? g_e.title : null,
                        sources: sources,
                      };
                      return episode_information;
                    } catch (error) {
                      colorize_error(
                        `[updateAllOngoing] Error fetching dub episode sources for ${g_e.id}: ${error}`
                      );
                      return null;
                    }
                  })
                );

                // After getting new episodes, let's update to the database
                if (updatedGogoDubEpisodes) {
                  colorize_info(
                    `${ong_ing.anilistId} have : ${alreadyAddedDubEpisodes.length} found : ${updatedGogoDubEpisodes.length}`
                  );
                  const storin = await Anime.findByIdAndUpdate(
                    {
                      _id: ong_ing._id,
                    },
                    { dub_episodes: updatedGogoDubEpisodes },
                    { new: true }
                  );
                  if (storin) {
                    colorize_success(
                      `[updateAllOngoing] ${storin.anilistId} ${storin._id} dub updated`
                    );
                    animeUpdated = true; // Mark as updated
                  } else {
                    colorize_error(
                      `[updateAllOngoing] something wrong. ${storin}`
                    );
                  }
                }
              } else {
                colorize_info(`[dub] ${ong_ing.anilistId} up-to-date`);
              }
            }
          }

          if (animeUpdated) {
            updatedCount++; // Increment the counter if the anime was updated
          }
        } catch (error) {
          colorize_error(
            `[updateAllOngoing] Error processing anime with AniList ID ${ong_ing.anilistId}: ${error}`
          );
        }
      });

      await Promise.all(updatePromises); // Wait for all updates to complete

      return updatedCount; // Return the number of updated animes
    } catch (error) {
      colorize_error(
        `[updateAllOngoing] Error fetching ongoing animes: ${error}`
      );
      return 0; // Return 0 in case of error
    }
  }

  /**
   * @param {string} anilistId
   * @returns {string} update information
   */
  static async updateDubEpisodesById(
    anilistId: string
  ): Promise<string | undefined> {
    try {
      // Lets give an info about work
      colorize_info(
        `[updateDubEpisodesById] initiating operation on (${anilistId})`
      );
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
              return `[${isExist.anilistId}] +${
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
        return `[${anilistId}] does not exist in database`;
      }
    } catch (error) {
      colorize_error(`${error}`);
      new Error(`error from updateDubEpisodesById`);
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
              hasNextPage: boolean;
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
          await new Promise((resolve) => setTimeout(resolve, 20000));
          request_Count = 0;
          colorize_info(`Interval reset... [p${variables.page}]`);
        }
      }
    }
  }

  /**
   * remove anime with 0 episodes
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
}

export { Jellyfish };
