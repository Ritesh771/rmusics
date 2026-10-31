function cleanSongTitle(raw) {
  if (!raw) return "";
  return raw.replace(/\s*[-_–—|•]?\s*(\[|\()?SpotubeDL\.com(\]|\))?/gi, "").replace(/\s*[-_–—|•]?\s*SpotubeDL/gi, "").replace(/\s*[-_–—|•]?\s*(\[|\()?Spotube(\]|\))?/gi, "").replace(/\s*[-_–—|•]\s*(www\.)?[a-zA-Z0-9-]+\.(com|net|org|in|co|io|cc|to|is)\b/gi, "").replace(/\.(mp3|m4a|flac|wav|ogg|opus|aac)$/i, "").replace(/\s+/g, " ").trim();
}
export {
  cleanSongTitle as c
};
