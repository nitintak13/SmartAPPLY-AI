import * as cheerio from "cheerio";

/**
 * @param {string} html
 * @returns {string}
 */
export function htmlToText(html) {
  if (!html || typeof html !== "string") return "";
  const $ = cheerio.load(html);
  $("script, style").remove();
  return $.text().replace(/\s+/g, " ").trim();
}
