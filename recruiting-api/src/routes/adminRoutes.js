import { Router } from "express";
import { 
    getAdminDashboard,
    getAllPlayerChoices,
    getPlayersList,
    getPlayerChoices,
    getCandidateChoices,
    getSessionSummary,
    getBiasAnalytics,
    clearAllPlayerChoices,
    clearAllSessionsAndChoices
} from "../controllers/adminController.js";


const router = Router();

// Serve admin dashboard
router.get("/dashboard", getAdminDashboard);

// Test endpoint
router.get("/test", testEndpoint);

// Get unique players list
router.get("/players", getPlayersList);

// Get player sessions (for analytics)
router.get("/sessions", getAllPlayerChoices);

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Admin routes working correctly" });
});

// Get all player choices with populated candidate details
router.get("/choices/details", getAllPlayerChoices);

// Get choices for specific player
router.get("/choices/player/:playerId", getPlayerChoices);

// Get choices involving specific candidate
router.get("/choices/candidate/:candidateId", getCandidateChoices);

// Get session summary for a specific player
router.get("/session/:playerId/summary", getSessionSummary);

// Get bias analytics for admin dashboard
router.get("/analytics/bias", getBiasAnalytics);

// Get overall analytics
router.get("/analytics/overview", getBiasAnalytics);

// Delete all player choices (testing/reset)
router.delete("/choices/clear", clearAllPlayerChoices);

// Delete all sessions and choices (testing/reset)
router.delete("/clear", clearAllSessionsAndChoices);

export default router;