import Candidate from "../models/Candidate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAllCandidates = asyncHandler(async (req, res) => {
	const candidates = await Candidate.find().sort({ candidate_id: 1 });
	res.json(candidates);
});

export const getCandidateById = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const candidate = await Candidate.findOne({ candidate_id: candidateId });
	
	if (!candidate) {
		return res.status(404).json({
			error: "Candidate not found",
			message: `Candidate with ID ${candidateId} does not exist`,
		});
	}
	
	res.json(candidate);
});

export const createCandidate = asyncHandler(async (req, res) => {
	const candidate = new Candidate(req.body);
	await candidate.save();
	res.status(201).json(candidate);
});

export const updateCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const candidate = await Candidate.findOneAndUpdate(
		{ candidate_id: candidateId },
		req.body,
		{ new: true, runValidators: true }
	);
	
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
	const candidate = await Candidate.findOneAndDelete({ candidate_id: candidateId });
	
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
	const candidates = await Candidate.find({ position }).sort({ candidate_id: 1 });
	res.json(candidates);
});

export const getCandidatesByGender = asyncHandler(async (req, res) => {
	const { gender } = req.params;
	const candidates = await Candidate.find({ gender }).sort({ candidate_id: 1 });
	res.json(candidates);
});