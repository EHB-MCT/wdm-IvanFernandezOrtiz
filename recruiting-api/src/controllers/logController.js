import PlayerChoices from "../models/PlayerChoices.js";
import Candidate from "../models/Candidate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createChoice = asyncHandler(async (req, res) => {
	const choice = new PlayerChoices(req.body);
	await choice.save();
	res.status(201).json({ status: "ok", id: choice._id });
});

export const createBatchChoices = asyncHandler(async (req, res) => {
	const { choices } = req.body;
	
	if (!Array.isArray(choices)) {
		return res.status(400).json({
			error: "Invalid request body",
			message: "choices field must be an array",
		});
	}
	
	if (choices.length === 0) {
		return res.status(400).json({
			error: "Invalid request body",
			message: "choices array cannot be empty",
		});
	}
	
	const savedChoices = await PlayerChoices.insertMany(choices);
	res.status(201).json({ 
		status: "ok", 
		created: savedChoices.length,
		ids: savedChoices.map(choice => choice._id)
	});
});

export const getAllChoices = asyncHandler(async (req, res) => {
	const choices = await PlayerChoices.find()
		.populate("chosen_candidate_id", "candidate_id gender position education workExperience skills")
		.populate("rejected_candidate_id", "candidate_id gender position education workExperience skills")
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoicesByPlayer = asyncHandler(async (req, res) => {
	const { playerId } = req.params;
	const choices = await PlayerChoices.find({ player_id: playerId })
		.populate("chosen_candidate_id", "candidate_id gender position education workExperience skills")
		.populate("rejected_candidate_id", "candidate_id gender position education workExperience skills")
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoicesByCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const choices = await PlayerChoices.find({ 
		$or: [
			{ chosen_candidate_id: candidateId },
			{ rejected_candidate_id: candidateId }
		]
	})
		.populate("chosen_candidate_id", "candidate_id gender position education workExperience skills")
		.populate("rejected_candidate_id", "candidate_id gender position education workExperience skills")
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoicesWithCandidateDetails = asyncHandler(async (req, res) => {
	const choices = await PlayerChoices.aggregate([
		{
			$lookup: {
				from: "candidates",
				localField: "chosen_candidate_id",
				foreignField: "candidate_id",
				as: "chosen_details",
			},
		},
		{
			$lookup: {
				from: "candidates",
				localField: "rejected_candidate_id",
				foreignField: "candidate_id",
				as: "rejected_details",
			},
		},
		{
			$unwind: {
				path: "$chosen_details",
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$unwind: {
				path: "$rejected_details",
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$sort: { timestamp: -1 },
		},
	]);
	
	res.json(choices);
});



export {
	createChoice,
	createBatchChoices,
	getAllChoices,
	getChoicesByPlayer,
	getChoicesByCandidate,
	getChoicesWithCandidateDetails,
	getChoiceAnalytics,
};