import { groqLLM } from "../clients/groq_llm.js";
import { htmlToText } from "../utils/htmlToText.js";
import { extractJson, normalizeResources } from "../utils/json_utils.js";
import { addToVectorStore, getRetriever } from "../rag/vector_store.js";
import { AIMessage } from "@langchain/core/messages";

function generatePrompt(jdText, skillsSummary = [], retrievedChunks = []) {
  const retrievedSummary = retrievedChunks.length
    ? `---RETRIEVED RESUME CONTEXT---\n${retrievedChunks
        .map((d, i) => `(${i + 1}) ${d.pageContent}`)
        .join("\n\n")}`
    : "";

  const skillsBlock = skillsSummary.length
    ? `---CANDIDATE SKILLS SUMMARY---\n${skillsSummary.join(", ")}`
    : "";

  return `
You are a FAANG-level recruiter with 10+ years of experience. 
Evaluate the resume against the job description. Be very strict, 
do not inflate scores, and justify your reasoning.

Return ONLY a raw JSON object with keys:
- score (0–100)  
- advice         
- fit_analysis: {summary, strengths, weaknesses}
- missing_skills 
- resume_suggestions 
- resources (list of {title, url})

---JOB DESCRIPTION---
${jdText}

${skillsBlock}

${retrievedSummary}
`;
}


async function directPrompt(resumeText, jdText) {
  const llm = groqLLM();
  const prompt = `
You are a FAANG-level recruiter with 10+ years of experience. 
Evaluate the resume against the job description strictly.

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
${jdText}
`;

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

  let retrievedDocs = [];
  try {
    retrievedDocs = await retriever.invoke(queryText);
  } catch {
  }

  try {
    const llm = groqLLM();

    const skillPrompt = `
Extract a flat list of candidate skills from the resume:
${resumePlain}
Return JSON array only, e.g. ["Python", "Node.js", "MongoDB"]
    `;
    const skillsResp = await llm.invoke(skillPrompt);
    let skillsSummary = [];
    try {
      skillsSummary = JSON.parse(
        skillsResp instanceof AIMessage
          ? skillsResp.content
          : String(skillsResp)
      );
    } catch {
      skillsSummary = [];
    }

    const prompt = generatePrompt(jdPlain, skillsSummary, retrievedDocs);
    const output = await llm.invoke(prompt);

    const rawOutput =
      output instanceof AIMessage ? output.content : String(output);

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
