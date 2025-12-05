import { Router } from "express";
import {
	createLog,
	getAllLogs,
	getLogsByPlayer,
	getLogsByCandidate,
} from "../controllers/logController.js";
import { validateLogInput, validateIdParam } from "../middleware/validation.js";

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
 *         - candidate_gender
 *         - candidate_position
 *         - candidate_education
 *         - candidate_workExperience
 *         - candidate_skills
 *         - tabs_viewed
 *         - time_taken
 *       properties:
 *         player_id:
 *           type: string
 *           description: Unique identifier for the player
 *         candidate_id:
 *           type: string
 *           description: Unique identifier for the candidate
 *         candidate_gender:
 *           type: string
 *           description: Gender of the candidate
 *         candidate_position:
 *           type: string
 *           description: Position the candidate is applying for
 *         candidate_education:
 *           type: string
 *           description: Education level of the candidate
 *         candidate_workExperience:
 *           type: string
 *           description: Work experience of the candidate
 *         candidate_skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of candidate skills
 *         tabs_viewed:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tabs the player viewed
 *         time_taken:
 *           type: number
 *           description: Time taken by the player in seconds
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

export default router;