/**
 * Utilities for cleaning and decoding rendered text, removing raw HTML entities such as
 * &#x43; ('C'), &#x20; (' '), &#x2103; ('°C'), and numeric entities.
 */

export function decodeHtmlEntities(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/&#x20;/gi, ' ')
    .replace(/&#x43;/gi, 'C')
    .replace(/&#x2103;/gi, '°C')
    .replace(/&#8451;/gi, '°C')
    .replace(/&#176;/gi, '°')
    .replace(/&deg;/gi, '°')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        const code = parseInt(hex, 16);
        return String.fromCharCode(code);
      } catch {
        return _;
      }
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        const code = parseInt(dec, 10);
        return String.fromCharCode(code);
      } catch {
        return _;
      }
    });
}
