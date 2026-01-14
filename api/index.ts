import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Security headers
app.use(helmet());
app.use(express.json());

// Rate limit (per serverless instance)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Example route
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Express API running on Vercel 🚀" });
});

// ❌ NO app.listen()
// ✅ Serverless export
export default app;
