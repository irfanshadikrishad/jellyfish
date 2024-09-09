import { Schema, model } from "mongoose";

const animeSchema = new Schema(
  {
    anilistId: {
      type: String,
      required: true,
    },
    malId: { type: String },
    title: {
      english: String,
      romaji: String,
      native: String,
      userPreferred: String,
    },
    description: String,
    poster: String,
    cover: String,
    sub_episodes: [
      {
        id: { type: String, required: false },
        title: { type: String, required: false },
        number: { type: Number, required: false },
      },
    ],
    dub_episodes: [
      {
        id: { type: String, required: false },
        title: { type: String, required: false },
        number: { type: Number, required: false },
      },
    ],
    origin: String,
    format: String,
    duration: String,
    status: String,
    airing_start: {
      year: String,
      month: String,
      day: String,
    },
    airing_end: {
      year: String,
      month: String,
      day: String,
    },
    genres: [String],
    synonyms: [String],
    isAdult: String,
    nextAiringEpisode: {
      airingTime: Number,
      timeUntilAiring: Number,
      episode: Number,
    },
    totalEpisodes: Number,
    studios: [String],
    season: String,
    release_date: String,
    isLicensed: { type: Boolean, required: false },
    color: { type: String, required: false },
    relations: [{}],
    trailer: {
      id: { type: String },
      url: { type: String, required: false },
      site: { type: String, required: false },
      thumbnail: { type: String, required: false },
    },
    recommendations: [String],
  },
  { timestamps: true }
);

const Anime = model("ANIME", animeSchema);

export default Anime;
