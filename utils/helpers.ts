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

function getCurrentDateAndTime() {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day}/${month}/${year} at ${formattedHours}:${minutes}${ampm}`;
}

function replaceMultipleHyphens(text: string) {
  return text.replace(/-{2,}/g, "-");
}

export { getTitle, getCurrentDateAndTime, replaceMultipleHyphens };
