import { Router } from "express";
import {
	getAllCandidates,
	getCandidateById,
	createCandidate,
	updateCandidate,
	deleteCandidate,
	getCandidatesByPosition,
	getCandidatesByGender,
	createBatchCandidates,
	clearAllCandidates,
	generateCandidates,
} from "../controllers/candidateController.js";
import { validateCandidateInput, validateIdParam } from "../middleware/validation.js";

const router = Router();

/**
 * @swagger
 * /api/candidates/generate:
 *   get:
 *     summary: Generate random candidates
 *     description: Generates random candidates using template engine and saves them to database.
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Number of candidates to generate
 *       - in: query
 *         name: seed
 *         schema:
 *           type: integer
 *         description: Seed for reproducible random generation (optional)
 *     responses:
 *       200:
 *         description: Candidates generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 generated:
 *                   type: number
 *                   description: Number of candidates generated
 *                   example: 100
 *                 requested:
 *                   type: number
 *                   description: Number of candidates requested
 *                   example: 100
 *                 seed:
 *                   type: string
 *                   description: Seed used for generation
 *                   example: "12345"
 *       500:
 *         description: Internal server error
 */
router.get("/generate", generateCandidates);

/**
 * @swagger
 * /api/candidates/clear:
 *   delete:
 *     summary: Clear all candidates
 *     description: Deletes all candidates from database. This operation cannot be undone.
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: Candidates cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 deleted:
 *                   type: number
 *                   description: Number of candidates deleted
 *                   example: 100
 *                 message:
 *                   type: string
 *                   example: "Successfully deleted 100 candidates"
 *       500:
 *         description: Internal server error
 */
router.delete("/clear", clearAllCandidates);

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates
 *     description: Retrieves all candidates from database sorted by candidate_id.
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of candidates to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of candidates to skip
 *     responses:
 *       200:
 *         description: List of all candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllCandidates);

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate
 *     description: Adds a new candidate to the database with validation for required fields.
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *           example:
 *             candidate_id: "candidate456"
 *             gender: "female"
 *             position: "Software Developer"
 *             education: "Bachelor's in Computer Science"
 *             workExperience: "5 years in web development"
 *             skills: ["JavaScript", "React", "Node.js", "MongoDB"]
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post("/", validateCandidateInput, createCandidate);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   delete:
 *     summary: Delete candidate by ID
 *     description: Removes a candidate from the database. This will also remove them from any log references.
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the candidate
 *         example: "candidate456"
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.delete("/:candidateId", validateIdParam("candidateId"), deleteCandidate);

export default router;