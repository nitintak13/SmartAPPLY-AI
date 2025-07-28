# 🚀 SmartApply – AI-Powered Job Application System

**SmartApply** is a full‑stack MERN application that transforms how candidates apply for jobs. It leverages **LangChain.js**, **Redis**, **Pinecone**, and **MongoDB** to deliver instant resume scoring, intelligent cooldowns, rate limiting, and recruiter‑focused applicant ranking—all built with real‑world product thinking.

---

## 🔥 Features

### 🧑‍💼 Applicant Experience

- ✅ **One‑Click Job Apply**

  - Instantly apply with AI‑powered feedback. Returns:

    - **Match Score**
    - **Missing Skills**
    - **Personalized Advice**

- 🧠 **AI Resume–JD Matching via LangChain.js**

  1. **Chunk & Embed** resume & JD text using **RecursiveCharacterTextSplitter** + **Hugging Face Inference API**
  2. **Store & Query** embeddings in **Pinecone** vector database
  3. **Retrieve Context** and generate fit analysis & advice with **Groq LLM**

- ❄️ **Cooldown System (Redis TTL)**

  - If your match score is **below 60**, a **5‑hour cooldown** is enforced
  - Prevents repeated low‑fit submissions

- ⚡ **Fast Rechecks via Redis Cache**

  - During cooldown, “Apply” returns cached results instantly—**no LLM call**

- 📄 **Resume Upload & Parsing**

  - Upload PDF → parse text with `pdf-parse` → feed into LangChain pipeline
  - Resume updates automatically **clear previous cache & cooldown**

- 🚫 **Rate Limiting**

  - Max **5 total apply attempts/hour**
  - Max **5 successful applications/hour**

- 📂 **Application Tracker**

  - Dashboard of all applied jobs with history of scores, advice, and statuses

### 🧑‍💼 Recruiter Experience

- 🧮 **Real‑Time Candidate Ranking**

  - Store applicants in **Redis Sorted Sets** (`job:<jobId>:applications`) keyed by match score
  - Instantly retrieve top candidates for any job

- 🔍 **Job‑Specific Filtering**

  - Fetch and rank applicants per position in real time

---

## 🧠 Product Thinking

| Problem                      | SmartApply Solution                         |
| ---------------------------- | ------------------------------------------- |
| Mass spam applications       | ✅ Cooldown + Rate Limit                    |
| High LLM costs               | 🔁 Redis caching of match results           |
| Recruiter screening overload | 📊 Redis Sorted Sets for instant ranking    |
| Lack of resume feedback      | 💡 LangChain‑generated improvement advice   |
| Unchanged resumes post‑edit  | 🧹 Resume updates automatically clear cache |

---

## 🛠️ Tech Stack

| Layer       | Technologies                                     |
| ----------- | ------------------------------------------------ |
| Frontend    | React, Tailwind CSS, Axios, Clerk.dev            |
| Backend     | Node.js, Express.js                              |
| AI/LLM      | LangChain.js, Hugging Face Inference, Groq LLM   |
| Vector DB   | Pinecone                                         |
| Database    | MongoDB + Mongoose                               |
| Cache       | Redis (TTL, rate limiting, sorted sets, caching) |
| Auth        | Clerk.dev                                        |
| File Upload | `pdf-parse`, Cloudinary                          |

---

## 🌐 RAG Pipeline Overview

1. **Parse & Clean** PDF resume → plain text
2. **Chunk & Embed** using `RecursiveCharacterTextSplitter` + Hugging Face
3. **Store & Retrieve** in Pinecone vector index
4. **Combine Context** top documents + JD into prompt
5. **LLM Invoke** via Groq to generate JSON response
6. **Cache & Cooldown** store result in Redis if score < 60

Example JSON response:

```json
{
  "score": number,
  "advice": string,
  "fit_analysis": { "summary": string, "strengths": [], "weaknesses": [] },
  "missing_skills": [],
  "resume_suggestions": [],
  "resources": [{ "title": "", "url": "" }]
}
```

---

## 📦 Getting Started

```bash
# Clone & install
git clone https://github.com/your-repo/smartapply.git
cd smartapply
npm install

# Setup environment variables (.env)
#   MONGODB_URI=
#   REDIS_URL=
#   PINECONE_API_KEY=
#   PINECONE_ENVIRONMENT=
#   PINECONE_INDEX=
#   HUGGINGFACE_API_KEY=
#   GROQ_API_KEY=
#   CLERK_API_KEY=
#   VITE_BACKEND_URL=http://localhost:5000

# Run the application
npm run dev  # runs both backend and frontend
```

---

## 📬 Feedback & Contributions

Feel free to open issues or PRs. For questions or suggestions, contact [youremail@example.com](mailto:youremail@example.com).
