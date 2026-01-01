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
} from "../controllers/candidateController.js";
import { validateCandidateInput, validateIdParam } from "../middleware/validation.js";

const router = Router();

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates
 *     description: Retrieves all candidates from the database sorted by candidate_id.
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
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter candidates by position
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter candidates by gender
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
 *   get:
 *     summary: Get candidate by ID
 *     description: Retrieves a specific candidate by their unique identifier.
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
 *         description: Candidate details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/:candidateId", validateIdParam("candidateId"), getCandidateById);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   put:
 *     summary: Update candidate by ID
 *     description: Updates an existing candidate's information. All fields are optional but at least one must be provided.
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the candidate
 *         example: "candidate456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *           example:
 *             position: "Senior Software Developer"
 *             workExperience: "7 years in web development"
 *             skills: ["JavaScript", "React", "Node.js", "MongoDB", "AWS"]
 *     responses:
 *       200:
 *         description: Candidate updated successfully
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
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.put("/:candidateId", validateIdParam("candidateId"), validateCandidateInput, updateCandidate);

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

/**
 * @swagger
 * /api/candidates/position/{position}:
 *   get:
 *     summary: Get candidates by position
 *     description: Retrieves all candidates applying for a specific position.
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: position
 *         required: true
 *         schema:
 *           type: string
 *         description: Position to filter by
 *         example: "Software Developer"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of candidates to return
 *     responses:
 *       200:
 *         description: List of candidates for the specified position
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *       500:
 *         description: Internal server error
 */
router.get("/position/:position", getCandidatesByPosition);

/**
 * @swagger
 * /api/candidates/gender/{gender}:
 *   get:
 *     summary: Get candidates by gender
 *     description: Retrieves all candidates of a specific gender.
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: gender
 *         required: true
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Gender to filter by
 *         example: "female"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of candidates to return
 *     responses:
 *       200:
 *         description: List of candidates for the specified gender
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid gender value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/gender/:gender", getCandidatesByGender);

/**
 * @swagger
 * /api/candidates/batch:
 *   post:
 *     summary: Create multiple candidates at once
 *     description: Efficiently creates multiple candidates in a single request. Maximum 100 candidates per batch.
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidates
 *             properties:
 *               candidates:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   $ref: '#/components/schemas/Candidate'
 *                 description: Array of candidate entries to create
 *     responses:
 *       201:
 *         description: Candidates created successfully
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
 *                   description: Number of candidates created
 *                   example: 50
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of created candidate IDs
 *       400:
 *         description: Bad request - validation failed or batch too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post("/batch", createBatchCandidates);

export default router;