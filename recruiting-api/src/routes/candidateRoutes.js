import { Router } from "express";
import {
	getAllCandidates,
	getCandidateById,
	createCandidate,
	updateCandidate,
	deleteCandidate,
	getCandidatesByPosition,
	getCandidatesByGender,
} from "../controllers/candidateController.js";
import { validateCandidateInput, validateIdParam } from "../middleware/validation.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       required:
 *         - candidate_id
 *         - gender
 *         - position
 *         - education
 *         - workExperience
 *         - skills
 *       properties:
 *         candidate_id:
 *           type: string
 *           description: Unique identifier for the candidate
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the candidate
 *         position:
 *           type: string
 *           description: Position the candidate is applying for
 *         education:
 *           type: string
 *           description: Education level of the candidate
 *         workExperience:
 *           type: string
 *           description: Work experience of the candidate
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of candidate skills
 */

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: List of all candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 */
router.get("/", getAllCandidates);

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 */
router.post("/", validateCandidateInput, createCandidate);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     responses:
 *       200:
 *         description: Candidate details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 */
router.get("/:candidateId", validateIdParam("candidateId"), getCandidateById);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   put:
 *     summary: Update candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 */
router.put("/:candidateId", validateIdParam("candidateId"), validateCandidateInput, updateCandidate);

/**
 * @swagger
 * /api/candidates/{candidateId}:
 *   delete:
 *     summary: Delete candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the candidate
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 */
router.delete("/:candidateId", validateIdParam("candidateId"), deleteCandidate);

/**
 * @swagger
 * /api/candidates/position/{position}:
 *   get:
 *     summary: Get candidates by position
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: position
 *         required: true
 *         schema:
 *           type: string
 *         description: Position to filter by
 *     responses:
 *       200:
 *         description: List of candidates for the specified position
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 */
router.get("/position/:position", getCandidatesByPosition);

/**
 * @swagger
 * /api/candidates/gender/{gender}:
 *   get:
 *     summary: Get candidates by gender
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: gender
 *         required: true
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Gender to filter by
 *     responses:
 *       200:
 *         description: List of candidates for the specified gender
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 */
router.get("/gender/:gender", getCandidatesByGender);

export default router;