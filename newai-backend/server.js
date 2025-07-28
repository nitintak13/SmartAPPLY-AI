import express from "express";
import cors from "cors";
import matchRouter from "./routes/match.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "SmartApply AI backend is running." });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/match", matchRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
