import { META, ANIME } from "@consumet/extensions";
import Anime from "../schema/anime";
import fetch from "node-fetch";
import * as fs from "fs";

const anilist = new META.Anilist();
const gogoanime = new ANIME.Gogoanime();

import {
  colorize_error,
  colorize_info,
  colorize_mark2,
  colorize_mark4,
  colorize_success,
} from "../utils/colorize";
import {
  getGogoIDFromEpisodeId,
  getTitle,
  replaceMultipleHyphens,
} from "../utils/helpers";

class Jellyfish {
  /**
   * Inserts single Anime by Anilist ID.
   * @param {string} anilistId - Anilist ID.
   * @returns {Promise<any>} The result of the save operation or error.
   */
  static async singleInsertById(
    anilistId: string,
    absoluteGogoSubId?: string,
    absoluteGogoDubId?: string
  ): Promise<any> {
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
          season,
          releaseDate,
          recommendations,
          isLicensed,
          color,
          relations,
          trailer,
        } = await anilist.fetchAnimeInfo(anilistId, false);

        // GET GOGOID > GOGO_EPISODES > GOGO_EPISODE_SOURCES
        let gogo_subId: string | undefined = absoluteGogoSubId
          ? absoluteGogoSubId
          : episodes?.[0]?.id
          ? String(episodes[0].id).split("-").slice(0, -2).join("-")
          : undefined;
        // If dub is included, remove it for sub
        if (gogo_subId && gogo_subId.includes("-dub")) {
          gogo_subId = gogo_subId.split("-dub").slice(0, -1).join("");
        }
        const gogo_dubId: string = absoluteGogoDubId
          ? absoluteGogoDubId
          : replaceMultipleHyphens(`${gogo_subId}-dub`);
        colorize_info(`[subId] : ${gogo_subId}`);
        colorize_info(`[dubId] : ${gogo_dubId}`);
        // STORAGE
        let sub_episodes: any[] = [];
        let dub_episodes: any[] = [];
        // GET SUB EPISODES
        if (gogo_subId && !gogo_subId.includes("undefined")) {
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
            colorize_error(`[sub] not-found.`);
          }
        } else {
          colorize_error(`[sub] subId undefined.`);
        }
        colorize_success(`[sub] [${anilistId}] ${sub_episodes.length}`);

        try {
          // GET DUB EPISODES
          if (gogo_dubId && !gogo_dubId.includes("undefined")) {
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
          } else {
            colorize_error(`[dub] dubId undefined.`);
          }
          colorize_success(`[dub] [${anilistId}] ${dub_episodes.length}`);
        } catch (error) {
          colorize_error(`[dub] not-found.`);
        }

        const resolvedRecommendations = await Promise.all(
          (recommendations || []).map(async ({ id }) => {
            const anime = await Anime.findOne({ anilistId: id });
            if (anime?._id) {
              return anime?._id;
            }
          })
        );

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
          totalEpisodes: totalEpisodes ? Number(totalEpisodes) : 0,
          airing_start: startDate,
          airing_end: endDate,
          status: status,
          synonyms: synonyms,
          genres: genres,
          isAdult: isAdult,
          nextAiringEpisode: nextAiringEpisode,
          studios: studios,
          season: season,
          release_date: releaseDate,
          recommendations: resolvedRecommendations.filter((id) => id !== null),
          isLicensed: isLicensed,
          color: color,
          relations: relations,
          trailer: trailer ? trailer : [],
        });

        if (
          sub_episodes.length === 0 &&
          dub_episodes.length === 0 &&
          typeof title === "object" &&
          title !== null
        ) {
          colorize_mark4(
            `[skip] [${getTitle(title)}] [sub] ${sub_episodes.length} [dub] ${
              dub_episodes.length
            } `
          );
        } else if (sub_episodes.length === 0 && dub_episodes.length === 0) {
          colorize_error(
            `[sub] ${sub_episodes.length} [dub] ${dub_episodes.length} • Aborting insertion...`
          );
        } else {
          const saved_Anime = await anime.save();
          if (saved_Anime) {
            return saved_Anime;
          } else {
            colorize_error(`[${anilistId}] save error`);
          }
        }
      } catch (error) {
        colorize_error(`[${anilistId}] not found. ${error}`);
      }
    } else {
      colorize_mark2(
        `\n[${
          isAlreadyAdded?.title?.english
            ? isAlreadyAdded?.title?.english
            : isAlreadyAdded?.title?.romaji
        }] [${isAlreadyAdded?.sub_episodes?.length}/${
          isAlreadyAdded?.dub_episodes?.length
        }/${isAlreadyAdded?.totalEpisodes}] already added.`
      );
      return `[${
        isAlreadyAdded?.title?.english
          ? isAlreadyAdded?.title?.english
          : isAlreadyAdded?.title?.romaji
      }] [${isAlreadyAdded?.sub_episodes?.length}/${
        isAlreadyAdded?.dub_episodes?.length
      }/${isAlreadyAdded?.totalEpisodes}] already added.`;
    }
  }

  /**
   * To delete anime by anilistId
   * @param {number} anilistId
   * @returns {any} returns if deleted or not
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
      throw new Error(`[r1] ${error}`);
    }
  }

  /**
   * Update All Ongoing Animes
   * @returns { episodesInserted, updatedAnimes }
   */
  static async updateAllOngoing(
    from?: number
  ): Promise<{ episodesInserted: number; updatedAnimes: any }> {
    try {
      let updatedAnimes = [];
      let episodesInserted = 0;
      let fakeIndex = from ? from : 1;
      const getAllOngoingAnimes = await Anime.find({ status: "Ongoing" });
      colorize_mark2(`\n[u0] ${getAllOngoingAnimes.length} ongoing currently.`);

      // Now need to traverse over all ongoing and check if it's outdated
      for (const ongoing of getAllOngoingAnimes.slice(
        from ? from : 0,
        getAllOngoingAnimes.length
      )) {
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
              const { nextAiringEpisode } = await anilist.fetchAnimeInfo(
                ongoing.anilistId
              );
              const storin = await Anime.findByIdAndUpdate(
                {
                  _id: ongoing._id,
                },
                {
                  sub_episodes: latestEpisodes,
                  nextAiringEpisode: nextAiringEpisode,
                },
                { new: true }
              );
              if (storin) {
                updatedAnimes.push(storin);
                colorize_success(
                  `[u0] [${fakeIndex}] [sub] [${ongoing.anilistId}] +${
                    latestEpisodes &&
                    latestEpisodes?.length - alreadyAddedEpisodes?.length
                  } episodes.`
                );
                let difference =
                  (latestEpisodes &&
                    latestEpisodes?.length - alreadyAddedEpisodes?.length) ||
                  0;
                episodesInserted += difference;
              }
            } else {
              colorize_info(
                `[u0] [${fakeIndex}] [sub] [${ongoing.anilistId}] up-to-date.`
              );
            }
          } catch (error) {
            colorize_error(
              `[u0] [${fakeIndex}] [sub] [${ongoing.anilistId}] ${error}`
            );
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
                updatedAnimes.push(storin);
                colorize_success(
                  `[u0] [${fakeIndex}] [dub] [${ongoing.anilistId}] +${
                    latestEpisodes &&
                    latestEpisodes?.length - alreadyAddedEpisodes?.length
                  } episodes.`
                );
                let difference =
                  (latestEpisodes &&
                    latestEpisodes.length - alreadyAddedEpisodes.length) ||
                  0;
                episodesInserted += difference;
              }
            } else {
              colorize_info(
                `[u0] [${fakeIndex}] [dub] [${ongoing.anilistId}] up-to-date.`
              );
            }
          } catch (error) {
            colorize_error(
              `[u0] [${fakeIndex}] [dub] [${ongoing.anilistId}] no-dubs-available`
            );
          }
        }
        // STATUS UPDATE FROM ONGOING TO FINISHED | ELSE.
        // We need subInfo, so its better to be inside sub section
        try {
          const { status, nextAiringEpisode } = await anilist.fetchAnimeInfo(
            ongoing.anilistId
          );
          if (status !== ongoing?.status) {
            const update_Status = await Anime.findByIdAndUpdate(
              {
                _id: ongoing._id,
              },
              { status: status, nextAiringEpisode: nextAiringEpisode },
              { new: true }
            );
            if (update_Status) {
              colorize_success(
                `[u0] [${fakeIndex}] [${ongoing.anilistId}] [status] ${ongoing?.status} => ${status}`
              );
            } else {
              colorize_error(
                `[u0] [${fakeIndex}] [${ongoing.anilistId}] [status] update-error.`
              );
            }
          } else {
            colorize_info(
              `[u0] [${fakeIndex}] [${ongoing.anilistId}] [status] up-to-date.`
            );
          }
        } catch (error) {
          colorize_error(
            `[u0] [${fakeIndex}] [${ongoing.anilistId}] [status] ${error}`
          );
        }
        // Updating Index Count
        fakeIndex++;

        // bypass rate-limit by waiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      return { episodesInserted, updatedAnimes };
    } catch (error) {
      throw new Error(`[u0] ${error}`);
    }
  }

  /**
   * To update dub episodes of anime by anilistId
   * @param {string} anilistId
   * @returns {string} update information
   */
  static async updateDubEpisodesById(
    anilistId: string
  ): Promise<string | undefined> {
    try {
      // Lets give an info about work
      colorize_info(`Initiating...`);
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
            return `[${
              isExist?.title?.english
                ? isExist?.title?.english
                : isExist?.title?.romaji
            }] already up-to-date`;
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
      throw new Error(`[ud] ${error}`);
    }
  }

  /**
   * Insert all animes
   * @param {number} from page number
   * @returns {any}
   */
  static async insertAllAnimes(from?: number): Promise<any> {
    let loop = true;
    let request_Count = 0;
    let animeInserted = 0;
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
          media(type: ANIME, sort: ID_DESC, status_not: NOT_YET_RELEASED) {
            id
          }
        }
      }
    `;
    let variables = { page: from ? from : 1, perPage: 1 };

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
            const saved_Anime = await Jellyfish.singleInsertById(
              String(anime.id)
            );

            if (saved_Anime && saved_Anime?._id) {
              animeInserted++;
              colorize_mark2(
                `[${animeInserted}] [${
                  saved_Anime?.title?.english
                    ? saved_Anime?.title?.english
                    : saved_Anime?.title?.romaji
                }] [${saved_Anime.anilistId}] inserted.`
              );
            }
          } catch (error) {
            // In case of error show the error and move to the next page
            colorize_error(String(error));
          }
        }

        request_Count++;
        // Counter to bypass rate-limit
        if (request_Count >= 1) {
          colorize_info(
            `[${animeInserted}/${variables.page}/${response?.data?.Page?.pageInfo?.total}] Interval initiated...`
          );
          await new Promise((resolve) => setTimeout(resolve, 3000));
          request_Count = 0;
          colorize_info(
            `[${animeInserted}/${variables.page}/${response?.data?.Page?.pageInfo?.total}] Interval reset...`
          );
          // SAVE THE LAST INSERTED PAGE NUMBER, IN CASE OF EMERGENCIES
          fs.appendFile("logs.txt", `\n${variables.page}`, (err) => {
            if (err) {
              colorize_error(`[iall-fs] ${err}`);
            }
          });
        }

        if (variables.page < (response?.data?.Page?.pageInfo?.total || 0)) {
          variables.page += 1;
        } else {
          loop = false;
          return `[iall] ${animeInserted} inserted successfully.`;
        }
      }
    }
  }

  /**
   * Remove's anime if both sub and dub episodes are missing
   * @returns {Promise<number>} number of documents deleted
   */
  static async remove_Zero(): Promise<number> {
    try {
      const removed_0 = await Anime.deleteMany({
        $and: [{ sub_episodes: { $size: 0 } }, { dub_episodes: { $size: 0 } }],
      });

      if (removed_0.acknowledged) {
        return removed_0.deletedCount;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(`[r0] ${error}`);
    }
  }

  /**
   * To get the statistics from database
   * @returns total_anime
   * @returns status_ongoing
   * @returns format_TV
   * @returns format_TV_Short
   * @returns format_Movie
   * @returns format_Special
   * @returns format_OVA
   * @returns format_ONA
   * @returns origin_japan
   * @returns origin_southKorea
   * @returns origin_china
   * @returns total_adult
   */
  static async getStats(): Promise<any> {
    try {
      const total_Anime = await Anime.find({});
      const ongoing = await Anime.find({ status: "Ongoing" });
      const adult = await Anime.find({ isAdult: true });
      const origin_japan = await Anime.find({ origin: "JP" });
      const origin_southKorea = await Anime.find({ origin: "KR" });
      const origin_china = await Anime.find({ origin: "CN" });
      const tv = await Anime.find({ format: "TV" });
      const tv_Shrot = await Anime.find({ format: "TV_SHORT" });
      const movie = await Anime.find({ format: "MOVIE" });
      const special = await Anime.find({ format: "SPECIAL" });
      const ova = await Anime.find({ format: "OVA" });
      const ona = await Anime.find({ format: "ONA" });

      return {
        total_anime: total_Anime.length,
        status_ongoing: ongoing.length,
        format_TV: tv.length,
        format_TV_Short: tv_Shrot.length,
        format_Movie: movie.length,
        format_Special: special.length,
        format_OVA: ova.length,
        format_ONA: ona.length,
        origin_japan: origin_japan.length,
        origin_southKorea: origin_southKorea.length,
        origin_china: origin_china.length,
        total_adult: adult.length,
      };
    } catch (error) {
      throw new Error(`[stats] ${error}`);
    }
  }

  /**
   * To insert all anime by their name
   * @param name - name of the anime
   * @returns total inserted anime
   */
  static async insertAllByName(name: string): Promise<any> {
    try {
      let page = 1;
      let loop = true;
      let animeInserted = 0;
      while (loop) {
        let anime = null;
        try {
          anime = await anilist.search(name, page, 1);

          if (!anime.results[0]?.id || !anime.hasNextPage) {
            return animeInserted;
          }

          const saved_Anime = await Jellyfish.singleInsertById(
            anime.results[0].id
          );
          // Check if its Saved
          if (saved_Anime && saved_Anime.anilistId) {
            animeInserted++;
            colorize_mark2(
              `[${animeInserted}] [${
                saved_Anime.title.english
                  ? saved_Anime.title.english
                  : saved_Anime.title.romaji
              }] inserted.`
            );
          }
          // Exiting the operation
          if (!anime.hasNextPage) {
            loop = false;
            return animeInserted;
          } else {
            // Can setInterval here
            page++;
          }
        } catch (error) {
          colorize_error(`[iname] ${error}`);
          // Exiting the operation
          if (!anime?.hasNextPage) {
            loop = false;
            return animeInserted;
          } else {
            // Can setInterval here
            page++;
          }
        }
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /**
   * Removes nextAiringTime from all animes
   */
  static async remove_nextAiringEpisode(): Promise<any> {
    try {
      const { modifiedCount } = await Anime.updateMany(
        {},
        { $unset: { nextAiringEpisode: {} } }
      );
      if (modifiedCount) {
        return modifiedCount;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
  /**
   * Removes recommendations from all animes
   */
  static async remove_Recommendations(): Promise<any> {
    try {
      const { modifiedCount } = await Anime.updateMany(
        {},
        { $unset: { recommendations: [] } }
      );
      if (modifiedCount) {
        return modifiedCount;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /**
   * Update all dubs from database
   * @returns details
   */
  static async updateAllDubs(from?: number): Promise<{
    updated: number;
    episodes_added: number;
  }> {
    try {
      let count = from ? from : 0;
      let details = { updated: 0, episodes_added: 0 };
      const animes = await Anime.find({}).sort({ airing_start: -1 });
      colorize_info(`\n[udall] [${animes.length}] initialiing.`);
      for (const anime of animes.slice(from ? from : 0, animes.length)) {
        count++;
        const { _id, title, anilistId, dub_episodes } = anime;
        try {
          const dubEpisodeId = dub_episodes[0]?.id;
          if (dubEpisodeId) {
            const dubId = dubEpisodeId.split("-episode-")[0];
            const gogoInfo = await gogoanime.fetchAnimeInfo(dubId);
            if (
              dub_episodes?.length !== gogoInfo.episodes?.length &&
              anilistId !== "101918" &&
              anilistId !== "12231"
            ) {
              // update
              const update = await Anime.findByIdAndUpdate(
                { _id: _id },
                {
                  dub_episodes: gogoInfo.episodes,
                },
                { new: true }
              );
              if (update) {
                details.updated++;
                details.episodes_added +=
                  Number(gogoInfo?.episodes?.length) -
                  Number(anime?.dub_episodes?.length);
                colorize_mark2(
                  `[udall] [${
                    title?.english ? title?.english : title?.romaji
                  }] +${
                    Number(gogoInfo?.episodes?.length) -
                    Number(dub_episodes?.length)
                  }`
                );
              } else {
                colorize_error(
                  `[udall] [${count}/${animes.length}] [${
                    title?.english ? title?.english : title?.romaji
                  }] update failed.`
                );
              }
            } else {
              colorize_info(
                `[udall] [${count}/${animes.length}] [${
                  title?.english ? title?.english : title?.romaji
                }] up-to-date.`
              );
            }
          } else {
            colorize_info(
              `[udall] [${count}/${animes.length}] [${
                title?.english ? title?.english : title?.romaji
              }] no-dub-id.`
            );
          }
        } catch (error) {
          colorize_error(
            `[udall] [${count}/${animes.length}] [${
              title?.english ? title?.english : title?.romaji
            }] ${error}`
          );
        }
      }
      return details;
    } catch (error) {
      throw new Error(`[udall] ${error}`);
    }
  }

  /**
   * Get the distict values
   */
  static async distinct(): Promise<void> {
    try {
      const origin = await Anime.distinct("origin");
      colorize_mark2(`\nOrigin`);
      console.log(origin);
      const status = await Anime.distinct("status");
      colorize_mark2(`Status`);
      console.log(status);
      const format = await Anime.distinct("format");
      colorize_mark2(`Format`);
      console.log(format);
      const season = await Anime.distinct("season");
      colorize_mark2(`Season`);
      console.log(season);
      const genres = await Anime.distinct("genres");
      colorize_mark2(`Genres`);
      console.log(genres);
      const year = await Anime.distinct("airing_start.year");
      colorize_mark2(`Year`);
      console.log(year);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /**
   * Update Seasons (eg: FALL, SPRING, SUMMER or WINTER)
   * @returns total update count
   */
  static async updateSeason(): Promise<any> {
    try {
      const nulls = await Anime.find({ season: null });
      let updated = 0;
      let count = 0;
      colorize_info(`\n[${nulls.length}]`);
      for (const nullz of nulls) {
        const { season } = await anilist.fetchAnimeInfo(nullz.anilistId);
        if (nullz.season !== season) {
          const update = await Anime.findByIdAndUpdate(
            { _id: nullz._id },
            { season: season },
            { new: true }
          );
          if (update) {
            colorize_mark2(
              `[${count}] [${nullz.anilistId}] [${update.season}]`
            );
            updated++;
          }
        } else {
          // Should not be the case
          colorize_info(`[us] [${nullz.anilistId}] already up-to-date.`);
        }
        count++;
        colorize_info(`interval...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      return updated;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /**
   * Refresh documents
   * @returns total refreshed document(s) count
   */
  static async refresh(): Promise<any> {
    let totalRefreshed = 0;
    const allAnimes = await Anime.find();
    colorize_info(
      `Initializing refresh...\n${allAnimes.length} anime(s) found.\n`
    );
    for (let anime of allAnimes) {
      const documentID = anime?._id;
      const anilistID: string = anime?.anilistId;
      const gogoSubID: string = getGogoIDFromEpisodeId(
        anime?.sub_episodes[0]?.id
      );
      const gogoDubID: string = getGogoIDFromEpisodeId(
        anime?.dub_episodes[0]?.id
      );

      const deleted = await Anime.deleteOne({ _id: documentID });
      if (deleted) {
        const insertAgain = await Jellyfish.singleInsertById(
          anilistID,
          gogoSubID && gogoSubID,
          gogoDubID && gogoDubID
        );
        if (insertAgain) {
          totalRefreshed++;
          colorize_mark2(
            `[${totalRefreshed}] ${documentID} => ${insertAgain?._id}`
          );
        }
      }
    }

    return totalRefreshed;
  }
}

export { Jellyfish };
