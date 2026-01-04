import { Router } from "express";
import { migrateChoicesToSessions } from "../controllers/migrationController.js";

const router = Router();

// Migrate existing choices to session-based structure
router.post("/migrate", migrateChoicesToSessions);

export default router;