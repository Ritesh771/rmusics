/**
 * Sanitizes song titles by stripping unwanted watermarks, ripper site suffixes, and file extensions.
 * e.g., "Neenu Bagehariyada Haadu - SpotubeDL.com" -> "Neenu Bagehariyada Haadu"
 */
export function cleanSongTitle(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    // Remove SpotubeDL domain watermarks in all formats: - SpotubeDL.com, [SpotubeDL.com], (SpotubeDL.com)
    .replace(/\s*[-_–—|•]?\s*(\[|\()?SpotubeDL\.com(\]|\))?/gi, "")
    .replace(/\s*[-_–—|•]?\s*SpotubeDL/gi, "")
    .replace(/\s*[-_–—|•]?\s*(\[|\()?Spotube(\]|\))?/gi, "")
    // Remove generic ripper / download site suffixes like - downloadming.com, - pagalworld.com, etc.
    .replace(/\s*[-_–—|•]\s*(www\.)?[a-zA-Z0-9-]+\.(com|net|org|in|co|io|cc|to|is)\b/gi, "")
    // Remove audio file extension if left at the end
    .replace(/\.(mp3|m4a|flac|wav|ogg|opus|aac)$/i, "")
    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim();
}

