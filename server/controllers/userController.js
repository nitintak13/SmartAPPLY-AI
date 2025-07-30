import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import redis from "../config/redis.js";
import { GoogleGenAI } from "@google/genai";
import { clerkClient } from "@clerk/clerk-sdk-node";
import axios from "axios";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const getUserJobApplications = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary");

    if (!applications) {
      return res.json({
        success: false,
        message: "No job applications found for this user.",
      });
    }

    return res.json({ success: true, applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const getUserData = async (req, res) => {
  const userId = req.auth.userId;

  try {
    let user = await User.findById(userId);
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      user = await User.create({
        _id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName + " " + clerkUser.lastName,
        image: clerkUser.imageUrl,
        resume: "",
        resumeText: "",
      });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const applyForJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.auth.userId;

  const rateLimit = 10;
  const windowSec = 60 * 60;
  const rateLimitKey = `rate:user:${userId}`;
  const cooldownKey = `cooldown:${userId}:${jobId}`;
  const scoreCacheKey = `score:${userId}:${jobId}`;

  const attempts = await redis.incr(rateLimitKey);
  if (attempts === 1) {
    await redis.expire(rateLimitKey, windowSec);
  }
  if (attempts > rateLimit) {
    const ttl = await redis.ttl(rateLimitKey);
    return res.json({
      success: false,
      rateLimited: true,
      message: `Too many attempts. Try again in ${Math.ceil(ttl / 60)} mins.`,
      retryAfter: Date.now() + ttl * 1000,
    });
  }

  try {
    const alreadyApplied = await JobApplication.findOne({ jobId, userId });
    if (alreadyApplied) {
      return res.json({ success: false, message: "Already Applied" });
    }

    if (await redis.exists(cooldownKey)) {
      const ttl = await redis.ttl(cooldownKey);
      const cached = JSON.parse((await redis.get(scoreCacheKey)) || "{}");

      return res.json({
        success: true,
        blocked: true,
        matchScore: cached.score || 0,
        advice: cached.advice || "No advice returned.",
        missingSkills: cached.missing_skills || [],
        resumeSuggestions: cached.resume_suggestions || [],
        resources: cached.resources || [],
        fitAnalysis: cached.fit_analysis || {},
        cooldownExpiry: Date.now() + ttl * 1000,
      });
    }

    const job = await Job.findById(jobId);
    const user = await User.findById(userId);
    if (!job || !user) {
      return res.json({ success: false, message: "Job or User not found" });
    }

    let aiData = {
      score: 0,
      advice: "No advice returned.",
      missing_skills: [],
      resume_suggestions: [],
      resources: [],
      fit_analysis: { summary: "", strengths: [], weaknesses: [] },
    };
    try {
      const { data } = await axios.post("https://nitintak13--smartapply-backend-serve-dev.modal.run/api/match/", {
        resume_text: user.resumeText || "",
        jd_text: job.description || "",
      });
      aiData = { ...aiData, ...data };
    } catch (err) {
      return res.json({ success: false, message: "failed." });
    }

    await redis.setex(scoreCacheKey, 24 * 60 * 60, JSON.stringify(aiData));

    if (aiData.score < 75) {
      const cooldownHours = 5;
      const ttl = cooldownHours * 60 * 60;
      await redis.setex(cooldownKey, ttl, "1");
      return res.json({
        success: true,
        blocked: true,
        matchScore: aiData.score,
        advice: aiData.advice,
        missingSkills: aiData.missing_skills,
        resumeSuggestions: aiData.resume_suggestions,
        resources: aiData.resources,
        fitAnalysis: aiData.fit_analysis,
        cooldownExpiry: Date.now() + ttl * 1000,
      });
    }

    const successKey = `rate:success:${userId}`;
    const successCount = await redis.incr(successKey);
    if (successCount === 1) {
      await redis.expire(successKey, windowSec);
    }
    if (successCount > rateLimit) {
      return res.json({
        success: false,
        rateLimited: true,
        message: "You've reached your hourly apply limit.",
      });
    }

    await JobApplication.create({
      companyId: job.companyId,
      userId,
      jobId,
      date: Date.now(),
      matchScore: aiData.score,
      aiAdvice: aiData.advice,
    });
    await redis.zadd(
      `job:${jobId}:applications`,
      aiData.score,
      `user:${userId}`
    );

    return res.json({
      success: true,
      blocked: false,
      matchScore: aiData.score,
      advice: aiData.advice,
      missingSkills: aiData.missing_skills,
      resumeSuggestions: aiData.resume_suggestions,
      resources: aiData.resources,
      fitAnalysis: aiData.fit_analysis,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserResume = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const rateKey = `resume:upload:${userId}`;
    const currentUploads = await redis.get(rateKey);
    if (currentUploads && parseInt(currentUploads) >= 3) {
      return res.json({
        success: false,
        message: "You have reached your resume upload limit for today.",
      });
    }

    if (!req.file) {
      return res.json({ success: false, message: "No file provided" });
    }

    const userData = await User.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const cloudinaryUpload = () =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });

    const resumeUrl = await cloudinaryUpload();
    userData.resume = resumeUrl;

    const pdfData = await pdfParse(req.file.buffer);
    userData.resumeText = pdfData.text;
    await userData.save();

    const allJobs = await Job.find({});
    for (const job of allJobs) {
      await redis.del(`score:${userId}:${job._id}`);
    }

    if (currentUploads) {
      await redis.incr(rateKey);
    } else {
      await redis.setex(rateKey, 24 * 60 * 60, 1);
    }

    return res.json({
      success: true,
      message: "Resume updated successfully.",
      resume: resumeUrl,
    });
  } catch (error) {
    console.error("updateUserResume error:", error);
    return res.json({ success: false, message: error.message });
  }
};
