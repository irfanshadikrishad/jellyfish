/**
 * Get the default title from title object
 * @param title { english?: string; romaji?: string; native?: string; userPreffered?: string;}
 * @returns single title as string
 */
function getTitle(title: {
  english?: string;
  romaji?: string;
  native?: string;
  userPreffered?: string;
}): string {
  if (title?.english) {
    return title?.english;
  } else if (title?.romaji) {
    return title?.romaji;
  } else if (title?.native) {
    return title?.native;
  } else if (title?.userPreffered) {
    return title?.userPreffered;
  } else {
    return "null";
  }
}

export { getTitle };
