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

export const getChoiceAnalytics = asyncHandler(async (req, res) => {
	const analytics = await PlayerChoices.aggregate([
		{
			$lookup: {
				from: "candidates",
				localField: "chosen_candidate_id",
				foreignField: "candidate_id",
				as: "chosen_details",
			},
		},
		{
			$unwind: {
				path: "$chosen_details",
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$group: {
				_id: null,
				totalChoices: { $sum: 1 },
				averageTimeTaken: { $avg: "$time_taken" },
				uniquePlayerCount: { $addToSet: "$player_id" },
				uniqueCandidateCount: { $addToSet: "$chosen_candidate_id" },
				allTabs: { $push: "$tabs_viewed" },
				genders: { $push: "$chosen_details.gender" },
				positions: { $push: "$position" },
			},
		},
		{
			$project: {
				totalChoices: 1,
				averageTimeTaken: { $round: ["$averageTimeTaken", 2] },
				uniquePlayerCount: { $size: "$uniquePlayerCount" },
				uniqueCandidateCount: { $size: "$uniqueCandidateCount" },
				mostViewedTabs: {
					$reduce: {
						input: "$allTabs",
						initialValue: { PROFILE: 0, SKILLS: 0, WORK: 0, EDUCATION: 0 },
						in: {
							$mergeObjects: [
								"$$value",
								{
									$arrayToObject: {
										$map: {
											input: "$$this",
											as: "tab",
											in: {
												k: "$$tab",
												v: {
													$add: [
														{ $ifNull: [{ $getField: { field: "$$tab", input: "$$value" } }, 0] },
														1
													]
												}
											}
										}
									}
								}
							]
						}
					}
				},
				genderDistribution: {
					$reduce: {
						input: "$genders",
						initialValue: {},
						in: {
							$mergeObjects: [
								"$$value",
								{
									$cond: {
										if: { $ne: ["$$this", null] },
										then: {
											$arrayToObject: [[
												{ k: "$$this", v: { $add: [{ $ifNull: [{ $getField: { field: "$$this", input: "$$value" } }, 0] }, 1] } }
											]]
										},
										else: "$$value"
									}
								}
							]
						}
					}
				},
				popularPositions: {
					$reduce: {
						input: "$positions",
						initialValue: {},
						in: {
							$mergeObjects: [
								"$$value",
								{
									$arrayToObject: [[
										{ k: "$$this", v: { $add: [{ $ifNull: [{ $getField: { field: "$$this", input: "$$value" } }, 0] }, 1] } }
									]]
								}
							]
						}
					}
				}
			}
		}
	]);

	const result = analytics[0] || {
		totalChoices: 0,
		averageTimeTaken: 0,
		uniquePlayerCount: 0,
		uniqueCandidateCount: 0,
		mostViewedTabs: { PROFILE: 0, SKILLS: 0, WORK: 0, EDUCATION: 0 },
		genderDistribution: {},
		popularPositions: {}
	};

	// Sort positions by count and return top 10
	const sortedPositions = Object.entries(result.popularPositions)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 10)
		.map(([position, count]) => ({ position, count }));

	res.json({
		...result,
		popularPositions: sortedPositions
	});
});


