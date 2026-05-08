import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import uploadRoutes from "./routes/uploadRoutes";
import { config } from "./config";

const app = express();

app.use(helmet());

app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());

app.use(
  cors({
    origin: config.frontendUrl,
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/", uploadRoutes);

app.listen(config.port, () => {
  console.log(
    `Server running on port ${config.port}`
  );
});