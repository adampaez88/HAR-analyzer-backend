import express from "express";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";

import { config } from "../config";
import { handleUpload } from "../controllers/uploadController";

const router = express.Router();

// Ensure upload dir exists (double safety layer)
const uploadDir = path.resolve(config.uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --------------------
// Multer Storage
// --------------------
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb
  ) => {
    cb(null, uploadDir);
  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// --------------------
// File Filter
// --------------------
const upload = multer({
  storage,

  limits: {
    fileSize: config.maxFileSize,
  },

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const isHar =
      file.originalname.endsWith(".har") ||
      file.mimetype.includes("json");

    if (!isHar) {
      return cb(new Error("Only .har files are allowed"));
    }

    cb(null, true);
  },
});

// --------------------
// Upload Route
// --------------------
router.post(
  "/upload",
  upload.fields([
    { name: "file1", maxCount: 1 },
    { name: "file2", maxCount: 1 },
  ]),
  handleUpload
);

export default router;