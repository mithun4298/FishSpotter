import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { identifyFish } from "./fishIdentification";
import multer from "multer";
import path from "path";
import { insertFishIdentificationSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Fish identification routes - single image
  app.post("/api/identify-fish", isAuthenticated, upload.single("image"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const userId = req.user.claims.sub;
      const imagePath = req.file.path;

      console.log("Processing single fish identification for user:", userId);
      console.log("Image path:", imagePath);

      // Identify the fish using Gemini API
      const identification = await identifyFish(imagePath);

      // Store the identification in the database
      const result = await storage.createFishIdentification({
        userId,
        imageUrl: `/uploads/${req.file.filename}`,
        species: identification.species,
        commonName: identification.commonName,
        confidence: identification.confidence.toString(),
        details: identification.details,
      });

      res.json(result);
    } catch (error) {
      console.error("Error identifying fish:", error);
      res.status(500).json({ message: "Failed to identify fish", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Fish identification routes - multiple images
  app.post("/api/identify-fish-batch", isAuthenticated, upload.array("images", 10), async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
      }

      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];

      console.log(`Processing batch fish identification for user: ${userId}, files: ${files.length}`);

      const results = [];
      const errors = [];

      // Process each image
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          console.log(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);
          
          // Identify the fish using Gemini API
          const identification = await identifyFish(file.path);

          // Store the identification in the database
          const result = await storage.createFishIdentification({
            userId,
            imageUrl: `/uploads/${file.filename}`,
            species: identification.species,
            commonName: identification.commonName,
            confidence: identification.confidence.toString(),
            details: identification.details,
          });

          results.push({
            ...result,
            originalName: file.originalname,
            success: true
          });
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          errors.push({
            originalName: file.originalname,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          });
        }
      }

      res.json({
        success: true,
        processedCount: results.length,
        errorCount: errors.length,
        totalFiles: files.length,
        results,
        errors
      });
    } catch (error) {
      console.error("Error in batch fish identification:", error);
      res.status(500).json({ message: "Failed to process batch identification", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/fish-identifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const identifications = await storage.getFishIdentificationsByUser(userId);
      res.json(identifications);
    } catch (error) {
      console.error("Error fetching identifications:", error);
      res.status(500).json({ message: "Failed to fetch identifications" });
    }
  });

  app.get("/api/fish-identifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const identification = await storage.getFishIdentification(id);
      
      if (!identification) {
        return res.status(404).json({ message: "Identification not found" });
      }

      // Check if the identification belongs to the current user
      const userId = req.user.claims.sub;
      if (identification.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(identification);
    } catch (error) {
      console.error("Error fetching identification:", error);
      res.status(500).json({ message: "Failed to fetch identification" });
    }
  });

  // Serve uploaded images
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
