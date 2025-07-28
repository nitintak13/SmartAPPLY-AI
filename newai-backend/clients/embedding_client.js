import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { config } from "dotenv";

config();

const embedder = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function embedText(texts) {
  if (!texts || texts.length === 0) return [];
  const embeddings = await embedder.embedDocuments(texts.map(String));
  return embeddings;
}
