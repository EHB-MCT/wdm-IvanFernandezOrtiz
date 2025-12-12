import { CandidateService } from "../services/candidateService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { parseQueryParams } from "../utils/responseHelpers.js";

export const getAllCandidates = asyncHandler(async (req, res) => {
	const { limit, offset } = parseQueryParams(req);
	const candidates = await CandidateService.getAllCandidates(limit, offset);
	res.json(candidates);
});

export const getCandidatesByPosition = asyncHandler(async (req, res) => {
	const { position } = req.params;
	const { limit } = parseQueryParams(req);
	const candidates = await CandidateService.getCandidatesByPosition(position, limit);
	res.json(candidates);
});

export const getCandidatesByGender = asyncHandler(async (req, res) => {
	const { gender } = req.params;
	const { limit } = parseQueryParams(req);
	const candidates = await CandidateService.getCandidatesByGender(gender, limit);
	res.json(candidates);
});

export const getCandidateById = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const candidate = await CandidateService.getCandidateById(candidateId);
	
	if (!candidate) {
		return res.status(404).json({
			error: "Candidate not found",
			message: `Candidate with ID ${candidateId} does not exist`,
		});
	}
	
	res.json(candidate);
});

export const createCandidate = asyncHandler(async (req, res) => {
	const candidate = await CandidateService.createCandidate(req.body);
	res.status(201).json(candidate);
});

export const updateCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const candidate = await CandidateService.updateCandidate(candidateId, req.body);
	
	if (!candidate) {
		return res.status(404).json({
			error: "Candidate not found",
			message: `Candidate with ID ${candidateId} does not exist`,
		});
	}
	
	res.json(candidate);
});

export const deleteCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const candidate = await CandidateService.deleteCandidate(candidateId);
	
	if (!candidate) {
		return res.status(404).json({
			error: "Candidate not found",
			message: `Candidate with ID ${candidateId} does not exist`,
		});
	}
	
	res.json({ message: "Candidate deleted successfully" });
});

export const getCandidatesByPosition = asyncHandler(async (req, res) => {
	const { position } = req.params;
	const limit = parseInt(req.query.limit) || 100;
	const candidates = await CandidateService.getCandidatesByPosition(position, limit);
	res.json(candidates);
});

export const getCandidatesByGender = asyncHandler(async (req, res) => {
	const { gender } = req.params;
	const limit = parseInt(req.query.limit) || 100;
	const candidates = await CandidateService.getCandidatesByGender(gender, limit);
	res.json(candidates);
});