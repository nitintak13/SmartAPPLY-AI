import { ChatGroq } from "@langchain/groq";

export function groqLLM() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama3-8b-8192";

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in environment variables.");
  }

  return new ChatGroq({
    apiKey,
    model,
    temperature: 0,
  });
}
