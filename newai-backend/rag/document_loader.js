import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Cleans input text by:
 * @param {string} text
 * @returns {string}
 */
export function cleanText(text) {
  return text
    .replace(/[^\x00-\x7F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 *
 * @param {string} text
 * @returns {Promise<string[]>}
 */
export async function chunkText(text) {
  if (typeof text !== "string" || !text.trim()) {
    return [];
  }

  const cleaned = cleanText(text);

  if (cleaned.length < 100) {
    console.log("Short input.");
    return [cleaned];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 80,
    separators: ["\n\n", "\n", ".", " ", ""],
  });

  try {
    const chunks = await splitter.splitText(cleaned);

    return chunks;
  } catch (err) {
    console.error(` Error : ${err.message}`);
    return [];
  }
}
