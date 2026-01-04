import { Router } from "express";
import {
    createPlayerSession,
    addChoiceToSession,
    getAllPlayerSessions,
    getPlayerSession,
    endPlayerSession,
    getSessionAnalytics,
    clearAllSessions
} from "../controllers/playerSessionController.js";
import { validateLogInput, validateIdParam, validateSessionChoice } from "../middleware/validation.js";

const router = Router();

// Create new player session (game start)
router.post("/", createPlayerSession);

// Add choice to existing session (round completed)
router.post("/:session_id/choice", validateSessionChoice, addChoiceToSession);

// Get all sessions (admin)
router.get("/", getAllPlayerSessions);

// Get specific session details
router.get("/:session_id", validateIdParam("session_id"), getPlayerSession);

// End session (game end or abandon)
router.post("/:session_id/end", validateIdParam("session_id"), endPlayerSession);

// Get session analytics
router.get("/analytics/overview", getSessionAnalytics);

// Clear all sessions
router.delete("/clear", clearAllSessions);

export default router;