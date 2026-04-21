// defines endpoint + middleware
import express from "express";
import multer from "multer";
import { config } from "../config";
import { handleUpload } from "../controllers/uploadController";

const router = express.Router();

// multer config (keep here for now)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: config.maxFileSize,
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