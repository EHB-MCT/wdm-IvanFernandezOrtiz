import { Router } from "express";
import {
	createLog,
	createBatchLogs,
	getAllLogs,
	getLogsByPlayer,
	getLogsByCandidate,
	getLogsWithCandidateDetails,
	getAnalytics,
} from "../controllers/logController.js";
import { validateLogInput, validateBatchLogInput, validateIdParam } from "../middleware/validation.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PlayerLog:
 *       type: object
 *       required:
 *         - player_id
 *         - candidate_id
 *         - tabs_viewed
 *         - time_taken
 *       properties:
 *         player_id:
 *           type: string
 *           description: Unique identifier for the player
 *         candidate_id:
 *           type: string
 *           description: Unique identifier for the selected candidate
 *         opponent_candidate_id:
 *           type: string
 *           description: Unique identifier for the opponent candidate (optional)
 *         tabs_viewed:
 *           type: array
 *           items:
 *             type: string
 *             enum: [CV, LINKEDIN, PORTFOLIO, SKILLS, EXPERIENCE, EDUCATION]
 *           description: List of tabs the player viewed
 *         time_taken:
 *           type: number
 *           minimum: 0
 *           description: Time taken by the player in seconds (must be non-negative)
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the log was created
 */

/**
 * @swagger
 * /api/log:
 *   post:
 *     summary: Create a new player log entry
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerLog'
 *     responses:
 *       201:
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 id:
 *                   type: string
 *                   description: The ID of the created log
 *       500:
 *         description: Server error
 */
router.post("/", validateLogInput, createLog);

/**
 * @swagger
 * /api/log:
 *   get:
 *     summary: Get all player logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: List of all logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerLog'
 *       500:
 *         description: Server error
 */
router.get("/", getAllLogs);

/**
 * @swagger
 * /api/log/player/{playerId}:
 *   get:
 *     summary: Get logs by player ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the player
 *     responses:
 *       200:
 *         description: List of logs for the specified player
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerLog'
 *       500:
 *         description: Server error
 */
router.get("/player/:playerId", validateIdParam("playerId"), getLogsByPlayer);

/**
 * @swagger
 * /api/log/candidate/{candidateId}:
 *   get:
 *     summary: Get logs by candidate ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     responses:
 *       200:
 *         description: List of logs for the specified candidate
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerLog'
 *       500:
 *         description: Server error
 */
router.get("/candidate/:candidateId", validateIdParam("candidateId"), getLogsByCandidate);

/**
 * @swagger
 * /api/log/batch:
 *   post:
 *     summary: Create multiple log entries at once
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - logs
 *             properties:
 *               logs:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PlayerLog'
 *                 description: Array of log entries to create
 *     responses:
 *       201:
 *         description: Logs created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 created:
 *                   type: number
 *                   description: Number of logs created
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: IDs of created logs
 *       400:
 *         description: Invalid request body
 */
router.post("/batch", validateBatchLogInput, createBatchLogs);

/**
 * @swagger
 * /api/log/analytics:
 *   get:
 *     summary: Get analytics data from logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLogs:
 *                   type: number
 *                   description: Total number of logs
 *                 averageTimeTaken:
 *                   type: number
 *                   description: Average time taken across all logs
 *                 uniquePlayerCount:
 *                   type: number
 *                   description: Number of unique players
 *                 uniqueCandidateCount:
 *                   type: number
 *                   description: Number of unique candidates
 *                 mostViewedTabs:
 *                   type: object
 *                   description: Count of each tab type viewed
 */
router.get("/analytics", getAnalytics);

/**
 * @swagger
 * /api/log/details:
 *   get:
 *     summary: Get all logs with full candidate details
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: List of logs with candidate details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   player_id:
 *                     type: string
 *                   candidate_id:
 *                     type: string
 *                   opponent_candidate_id:
 *                     type: string
 *                   tabs_viewed:
 *                     type: array
 *                     items:
 *                       type: string
 *                   time_taken:
 *                     type: number
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   candidate_details:
 *                     $ref: '#/components/schemas/Candidate'
 *                   opponent_details:
 *                     $ref: '#/components/schemas/Candidate'
 */
router.get("/details", getLogsWithCandidateDetails);

export default router;