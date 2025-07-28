import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.PINECONE_API_KEY;
const environment = process.env.PINECONE_ENVIRONMENT;
const indexName = process.env.PINECONE_INDEX;

if (!apiKey || !environment || !indexName) {
  throw new Error("Missing environment variables");
}

const pinecone = new Pinecone({ apiKey });

/**
 * @returns {Promise<import('@pinecone-database/pinecone').PineconeIndex>}
 */
export async function getPineconeIndex() {
  try {
    const { indexes } = await pinecone.listIndexes();
    const indexExists = indexes.some((i) => i.name === indexName);

    if (!indexExists) {
      await pinecone.createIndex({
        name: indexName,
        dimension: 384,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: environment,
          },
        },
      });
      await new Promise((res) => setTimeout(res, 5000));
    }

    return pinecone.index(indexName);
  } catch (error) {
    throw error;
  }
}
