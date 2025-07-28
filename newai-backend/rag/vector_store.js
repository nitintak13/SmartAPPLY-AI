import { getPineconeIndex } from "../clients/pinecone_client.js";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { chunkText } from "./document_loader.js";

const embedder = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function addToVectorStore(docId, rawText, namespace) {
  if (!rawText?.trim()) {
    return;
  }

  const chunks = await chunkText(rawText);
  if (!chunks.length) {
    return;
  }

  const documents = chunks.map(
    (chunk, i) =>
      new Document({
        pageContent: chunk.pageContent,
        metadata: { doc_id: docId, chunk_id: i },
      })
  );

  const pineconeIndex = await getPineconeIndex(process.env.PINECONE_INDEX);
  await PineconeStore.fromDocuments(documents, embedder, {
    pineconeIndex,
    namespace,
    textKey: "pageContent",
    metadataKey: "metadata",
  });
}

export async function getRetriever(namespace, topK = 5) {
  const pineconeIndex = await getPineconeIndex(process.env.PINECONE_INDEX);

  const store = await PineconeStore.fromExistingIndex(embedder, {
    pineconeIndex,
    namespace,
    textKey: "pageContent",
    metadataKey: "metadata",
  });

  return store.asRetriever({ k: topK });
}

export async function testRetrieval(query, namespace, topK = 5) {
  try {
    const retriever = await getRetriever(namespace, topK);
    const results = await retriever.invoke(query);
    // if (!results.length) console.warn(" No docs retrieved");
    // else {
    //   results.forEach((d, i) =>
    //     console.info(
    //       `  [${i + 1}] chunk_id=${d.metadata.chunk_id}: ${d.pageContent.slice(
    //         0,
    //         100
    //       )}...`
    //     )
    //   );
    // }
    return results;
  } catch (err) {
    return [];
  }
}
