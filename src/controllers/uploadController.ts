// handles http logic
import { Request, Response } from "express";
import { processHarFiles } from "../services/harService";
import { successResponse, errorResponse } from "../utils/response";
import fs from "fs/promises";
import { logger } from "../utils/logger";

export const handleUpload = async (req: Request, res: Response) => {
  logger.info("Processing HAR files");
  
  let file1Path: string | undefined;
  let file2Path: string | undefined;

  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files?.file1 || !files?.file2) {
      return res.status(400).json({ error: "Both files are required" });
    }

    const file1 = files.file1[0];
    const file2 = files.file2[0];

    file1Path = file1.path;
    file2Path = file2.path;

    const result = await processHarFiles(file1Path, file2Path);

    res.json(successResponse(result));
  } catch (error: any) {

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json(errorResponse(error.message || "File too large"));
    }

    res.status(400).json(errorResponse(error.message || "Failed to process HAR files"));
  } finally {
    // 🧹 Cleanup files no matter what
    try {
      if (file1Path) await fs.unlink(file1Path);
      if (file2Path) await fs.unlink(file2Path);
    } catch (cleanupError) {
      logger.error("File cleanup failed:", cleanupError);
    }
  }
};