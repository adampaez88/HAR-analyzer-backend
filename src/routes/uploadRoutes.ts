// defines endpoint + middleware
import express from "express";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { config } from "../config";
import { handleUpload } from "../controllers/uploadController";

const router = express.Router();

// multer config (keep here for now)
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    cb(null, config.uploadDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

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
      file.mimetype.includes("json") ||
      file.originalname.endsWith(".har");

    if (!isHar) {
      return cb(
        new Error("Only HAR files are allowed")
      );
    }

    cb(null, true);
  },
});

router.post(
  "/upload",
  upload.fields([
    { name: "file1", maxCount: 1 },
    { name: "file2", maxCount: 1 },
  ]),
  handleUpload
);

export default router;