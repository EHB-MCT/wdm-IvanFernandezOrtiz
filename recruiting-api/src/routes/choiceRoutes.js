import { Router } from "express";
import {
	createChoice,
	createBatchChoices,
	getAllChoices,
	getChoicesByPlayer,
	getChoicesByCandidate,
	getChoicesWithCandidateDetails,
	getChoiceAnalytics,
} from "../controllers/choiceController.js";
import { validateLogInput, validateBatchChoiceInput, validateIdParam } from "../middleware/validation.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PlayerChoice:
 *       type: object
 *       required:
 *         - player_id
 *         - chosen_candidate_id
 *         - position
 *         - time_taken
 *         - tabs_viewed
 *         - round_number
 *       properties:
 *         player_id:
 *           type: string
 *           description: Unique identifier for the player
 *           example: "player123"
 *         chosen_candidate_id:
 *           type: string
 *           description: ID of the chosen candidate
 *           example: "candidate456"
 *         rejected_candidate_id:
 *           type: string
 *           description: ID of the rejected candidate
 *           example: "candidate789"
 *         position:
 *           type: string
 *           description: Position being recruited for
 *           example: "Software Developer"
 *         time_taken:
 *           type: number
 *           minimum: 0
 *           description: Time taken to make decision in seconds
 *           example: 45.5
 *         tabs_viewed:
 *           type: array
 *           items:
 *             type: string
 *             enum: [PROFILE, SKILLS, WORK, EDUCATION]
 *           description: Tabs the player viewed during decision
 *           example: ["PROFILE", "SKILLS", "WORK"]
 *         round_number:
 *           type: number
 *           description: Round number in the game
 *           example: 3
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the choice was made
 *           example: "2023-12-05T10:30:00.000Z"
 *         _id:
 *           type: string
 *           description: MongoDB document ID
 *           example: "64a1b2c3d4e5f678901234567"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Document creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Document last update timestamp
 */

/**
 * @swagger
 * /api/choices:
 *   post:
 *     summary: Create a new player choice
 *     description: Records a player's choice between two candidates, including position, time taken, and tabs viewed.
 *     tags: [Choices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerChoice'
 *           example:
 *             player_id: "player123"
 *             chosen_candidate_id: "candidate456"
 *             rejected_candidate_id: "candidate789"
 *             position: "Software Developer"
 *             time_taken: 45.5
 *             tabs_viewed: ["PROFILE", "SKILLS", "WORK"]
 *             round_number: 3
 *     responses:
 *       201:
 *         description: Choice created successfully
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
 *                   description: The ID of the created choice
 *                   example: "64a1b2c3d4e5f678901234567"
 *       400:
 *         description: Bad request - validation failed or candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post("/", validateLogInput, createChoice);

/**
 * @swagger
 * /api/choices:
 *   get:
 *     summary: Get all player choices
 *     description: Retrieves all player choices with populated candidate details. Results are sorted by timestamp (newest first).
 *     tags: [Choices]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of choices to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of choices to skip for pagination
 *     responses:
 *       200:
 *         description: List of all choices with candidate details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PlayerChoice'
 *                   - type: object
 *                     properties:
 *                       chosen_details:
 *                         $ref: '#/components/schemas/Candidate'
 *                       rejected_details:
 *                         $ref: '#/components/schemas/Candidate'
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllChoices);

/**
 * @swagger
 * /api/choices/player/{playerId}:
 *   get:
 *     summary: Get choices by player ID
 *     description: Retrieves all choices for a specific player with populated candidate details.
 *     tags: [Choices]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the player
 *         example: "player123"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of choices to return
 *     responses:
 *       200:
 *         description: List of choices for the specified player with candidate details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PlayerChoice'
 *                   - type: object
 *                     properties:
 *                       chosen_details:
 *                         $ref: '#/components/schemas/Candidate'
 *                       rejected_details:
 *                         $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid player ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/player/:playerId", validateIdParam("playerId"), getChoicesByPlayer);

/**
 * @swagger
 * /api/choices/candidate/{candidateId}:
 *   get:
 *     summary: Get choices by candidate ID
 *     description: Retrieves all choices where the specified candidate was either chosen or rejected.
 *     tags: [Choices]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the candidate
 *         example: "candidate456"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of choices to return
 *     responses:
 *       200:
 *         description: List of choices for the specified candidate with opponent details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PlayerChoice'
 *                   - type: object
 *                     properties:
 *                       chosen_details:
 *                         $ref: '#/components/schemas/Candidate'
 *                       rejected_details:
 *                         $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid candidate ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/candidate/:candidateId", validateIdParam("candidateId"), getChoicesByCandidate);

/**
 * @swagger
 * /api/choices/batch:
 *   post:
 *     summary: Create multiple choice entries at once
 *     description: Efficiently creates multiple player choices in a single request. Maximum 100 choices per batch.
 *     tags: [Choices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - choices
 *             properties:
 *               choices:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   $ref: '#/components/schemas/PlayerChoice'
 *                 description: Array of choice entries to create
 *           example:
 *             choices:
 *               - player_id: "player123"
 *                 chosen_candidate_id: "candidate456"
 *                 rejected_candidate_id: "candidate789"
 *                 position: "Software Developer"
 *                 time_taken: 30.5
 *                 tabs_viewed: ["PROFILE", "SKILLS"]
 *                 round_number: 3
 *               - player_id: "player123"
 *                 chosen_candidate_id: "candidate789"
 *                 rejected_candidate_id: "candidate456"
 *                 position: "Software Developer"
 *                 time_taken: 45.2
 *                 tabs_viewed: ["PROFILE", "WORK", "EDUCATION"]
 *                 round_number: 4
 *     responses:
 *       201:
 *         description: Choices created successfully
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
 *                   description: Number of choices created
 *                   example: 2
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of created choice IDs in order
 *                   example: ["64a1b2c3d4e5f678901234567", "64a1b2c3d4e5f678901234568"]
 *       400:
 *         description: Bad request - validation failed or batch too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post("/batch", validateBatchChoiceInput, createBatchChoices);

/**
 * @swagger
 * /api/choices/analytics:
 *   get:
 *     summary: Get choice analytics data
 *     description: Provides aggregated analytics including total choices, average time, unique users/candidates, most viewed tabs, and popular positions.
 *     tags: [Choices]
 *     responses:
 *       200:
 *         description: Analytics data successfully calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalChoices:
 *                   type: number
 *                   description: Total number of choices in the system
 *                   example: 1250
 *                 averageTimeTaken:
 *                   type: number
 *                   description: Average time taken across all choices (rounded to 2 decimal places)
 *                   example: 42.75
 *                 uniquePlayerCount:
 *                   type: number
 *                   description: Number of unique players who have made choices
 *                   example: 85
 *                 uniqueCandidateCount:
 *                   type: number
 *                   description: Number of unique candidates that have been involved in choices
 *                   example: 45
 *                 mostViewedTabs:
 *                   type: object
 *                   description: Count of each tab type viewed across all choices
 *                   properties:
 *                     PROFILE:
 *                       type: number
 *                       example: 850
 *                     SKILLS:
 *                       type: number
 *                       example: 920
 *                     WORK:
 *                       type: number
 *                       example: 650
 *                     EDUCATION:
 *                       type: number
 *                       example: 480
 *                   additionalProperties:
 *                     type: number
 *                 popularPositions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Most popular positions for recruitment
 *                   example: ["Software Developer", "Data Analyst", "Product Manager"]
 *       500:
 *         description: Internal server error during analytics calculation
 */
router.get("/analytics", getChoiceAnalytics);

/**
 * @swagger
 * /api/choices/details:
 *   get:
 *     summary: Get all choices with full candidate details
 *     description: Returns all choices with complete candidate information using MongoDB aggregation. Includes both chosen and rejected candidate details.
 *     tags: [Choices]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of choices to return
 *       - in: query
 *         name: playerId
 *         schema:
 *           type: string
 *         description: Filter choices by a specific player ID
 *       - in: query
 *         name: candidateId
 *         schema:
 *           type: string
 *         description: Filter choices by a specific candidate ID
 *     responses:
 *       200:
 *         description: List of choices with complete candidate details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Choice entry ID
 *                     example: "64a1b2c3d4e5f678901234567"
 *                   player_id:
 *                     type: string
 *                     description: Player identifier
 *                     example: "player123"
 *                   chosen_candidate_id:
 *                     type: string
 *                     description: Chosen candidate ID
 *                     example: "candidate456"
 *                   rejected_candidate_id:
 *                     type: string
 *                     description: Rejected candidate ID
 *                     example: "candidate789"
 *                   position:
 *                     type: string
 *                     description: Position being recruited for
 *                     example: "Software Developer"
 *                   time_taken:
 *                     type: number
 *                     description: Time taken in seconds
 *                     example: 45.5
 *                   tabs_viewed:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [PROFILE, SKILLS, WORK, EDUCATION]
 *                     description: Tabs viewed by player
 *                     example: ["PROFILE", "SKILLS", "WORK"]
 *                   round_number:
 *                     type: number
 *                     description: Round number in the game
 *                     example: 3
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: When the choice was made
 *                     example: "2023-12-05T10:30:00.000Z"
 *                   chosen_details:
 *                     $ref: '#/components/schemas/Candidate'
 *                     description: Full details of chosen candidate
 *                   rejected_details:
 *                     $ref: '#/components/schemas/Candidate'
 *                     description: Full details of rejected candidate
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error during aggregation
 */
router.get("/details", getChoicesWithCandidateDetails);

export default router;