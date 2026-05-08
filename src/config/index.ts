import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  uploadDir: "uploads/",

  maxFileSize:
    Number(process.env.MAX_FILE_SIZE_MB || 25) *
    1024 *
    1024,

  frontendUrl:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
};