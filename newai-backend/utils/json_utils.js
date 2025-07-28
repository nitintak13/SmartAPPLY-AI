export function extractJson(text) {
  try {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    const jsonString = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return {};
  }
}

export function normalizeResources(resources) {
  if (!Array.isArray(resources)) return [];
  return resources.map((r) => {
    if (typeof r === "string") return { title: r };
    return r;
  });
}
