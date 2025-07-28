import dotenv from "dotenv";
dotenv.config();

export const settings = {
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,

  HUGGINGFACE_API_TOKEN: process.env.HUGGINGFACE_API_TOKEN,
  HUGGINGFACE_EMBEDDING_MODEL: process.env.HUGGINGFACE_EMBEDDING_MODEL,

  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,
};
