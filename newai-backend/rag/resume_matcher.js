import { groqLLM } from "../clients/groq_llm.js";
import { htmlToText } from "../utils/htmlToText.js";
import { extractJson, normalizeResources } from "../utils/json_utils.js";
import { addToVectorStore, getRetriever } from "../rag/vector_store.js";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { AIMessage } from "@langchain/core/messages";

function generatePrompt(resumeText, jdText) {
  return `
You are a FAANG-level recruiter with 10+ years of experience, extremely strict when evaluating resumes against job descriptions. Provide objective, experience-backed feedback.

Return ONLY a raw JSON object with keys:
- score (0–100)
- advice
- fit_analysis: {summary, strengths, weaknesses}
- missing_skills
- resume_suggestions
- resources (list of {title, url})

---RESUME---
${resumeText}

---JOB DESCRIPTION---
${jdText}`;
}

async function directPrompt(resumeText, jdText) {
  const prompt = generatePrompt(resumeText, jdText);
  const llm = groqLLM();
  const output = await llm.invoke(prompt);

  const rawOutput =
    output instanceof AIMessage ? output.content : String(output);

  const parsed = extractJson(rawOutput);
  if (parsed) {
    parsed.resources = normalizeResources(parsed.resources || []);
    return parsed;
  }

  throw new Error("Failed to parse LLM output from direct prompt");
}

export async function matchResumeToJD(resumeText, jdText, namespace) {
  const resumePlain = htmlToText(resumeText);
  const jdPlain = htmlToText(jdText);

  const docId = `session-${namespace}`;

  await addToVectorStore(`${docId}-resume`, resumePlain, namespace);

  await addToVectorStore(`${docId}-jd`, jdPlain, namespace);

  const retriever = await getRetriever(namespace);

  const queryText = jdPlain.split("\n", 1)[0].slice(0, 200);

  const retrievedDocs = await retriever.invoke(queryText);

  if (!retrievedDocs.length) {
    return await directPrompt(resumePlain, jdPlain);
  }

  try {
    const llm = groqLLM();

    const combineDocsChain = await createStuffDocumentsChain({ llm });

    const chain = await createRetrievalChain({
      retriever,
      combineDocsChain,
    });

    const result = await chain.invoke({
      input: generatePrompt(resumePlain, jdPlain),
    });

    const rawOutput =
      result?.answer ||
      result?.output_text ||
      (result instanceof AIMessage ? result.content : String(result));

    const parsed = extractJson(rawOutput);
    if (parsed) {
      parsed.resources = normalizeResources(parsed.resources || []);
      return parsed;
    }
    return await directPrompt(resumePlain, jdPlain);
  } catch (err) {
    return await directPrompt(resumePlain, jdPlain);
  }
}
