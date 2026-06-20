import express from "express";
const router = express.Router();

import * as AuthController from "../controllers/auth-controller.js";

import protect from "../middleware/authMiddleware.js";

// Register
router.post("/register", AuthController.register);

// Login
router.post("/login", AuthController.login);

// Get User
router.get("/profile", protect, AuthController.getProfile);

// Update User
router.put("/profile", protect, AuthController.updateProfile);

export default router;
