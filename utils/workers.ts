function replaceMultipleHyphens(text: string) {
  return text.replace(/-{2,}/g, "-");
}

export { replaceMultipleHyphens };
