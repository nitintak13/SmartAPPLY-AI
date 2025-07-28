import express from "express";
import { matchResumeToJD } from "../rag/resume_matcher.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Match API called.");
  console.log("Request received:", req.body);

  try {
    const { resume_text, jd_text } = req.body;
    if (!resume_text || !jd_text) {
      return res
        .status(400)
        .json({ success: false, message: "Missing resume_text or jd_text" });
    }

    const namespace = uuidv4();
    const result = await matchResumeToJD(resume_text, jd_text, namespace);

    const requiredKeys = [
      "score",
      "advice",
      "missing_skills",
      "resume_suggestions",
    ];
    for (const key of requiredKeys) {
      if (!(key in result)) {
        return res
          .status(500)
          .json({ success: false, message: `Missing key: ${key}` });
      }
    }

    const fit_analysis = result.fit_analysis || {};
    const resources = result.resources || [];

    const responsePayload = {
      success: true,
      message: "Match successful",
      score: result.score,
      advice: result.advice,
      missing_skills: result.missing_skills,
      resume_suggestions: result.resume_suggestions,
      fit_analysis,
      resources,
    };

    console.log("FINAL RESPONSE]", responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    console.error("ERROR", err.message || err);
    res
      .status(500)
      .json({ success: false, message: `Matching failed: ${err.message}` });
  }
});

export default router;
