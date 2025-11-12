// src/app.js
// Entry của backend: khởi tạo Express, middleware, routes

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connect } from "./config/db.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middleware/error.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
await connect();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Welcome to Fintr4ck API!" });
});

app.use("/api/v1", healthRoutes);
app.use("/api/v1", authRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
