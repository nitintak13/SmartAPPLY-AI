import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import companyRoutes from "./routes/companyRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import bodyParser from "body-parser";
const app = express();

connectDB();
await connectCloudinary();
const corsOptions = {
  // origin: "https://smart-apply-indol.vercel.app",
  origin: "http://localhost:5173",
  credentials: true,
};
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.post(
  "/webhooks",
  bodyParser.raw({ type: "application/json" }),
  clerkWebhooks
);

app.use((req, res, next) => {
  if (req.path === "/webhooks") return next();
  express.json()(req, res, next);
});
// app.post(
//   "/webhooks",
//   bodyParser.raw({ type: "application/json" }),
//   clerkWebhooks
// );
// app.use((req, res, next) => {
//   if (req.path === "/webhooks") return next();
//   express.json()(req, res, next);
// });
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("API Working"));
app.post("/webhooks", clerkWebhooks);

app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
