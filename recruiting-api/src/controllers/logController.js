import PlayerLog from "../models/PlayerLog.js";
import Candidate from "../models/Candidate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createLog = asyncHandler(async (req, res) => {
	const log = new PlayerLog(req.body);
	await log.save();
	res.status(201).json({ status: "ok", id: log._id });
});

export const createBatchLogs = asyncHandler(async (req, res) => {
	const { logs } = req.body;
	
	if (!Array.isArray(logs)) {
		return res.status(400).json({
			error: "Invalid request body",
			message: "logs field must be an array",
		});
	}
	
	if (logs.length === 0) {
		return res.status(400).json({
			error: "Invalid request body",
			message: "logs array cannot be empty",
		});
	}
	
	const savedLogs = await PlayerLog.insertMany(logs);
	res.status(201).json({ 
		status: "ok", 
		created: savedLogs.length,
		ids: savedLogs.map(log => log._id)
	});
});

export const getAllLogs = asyncHandler(async (req, res) => {
	const logs = await PlayerLog.find()
		.populate("candidate_id", "candidate_id gender position education workExperience skills")
		.populate("opponent_candidate_id", "candidate_id gender position education workExperience skills")
		.sort({ timestamp: -1 });
	res.json(logs);
});

export const getLogsByPlayer = asyncHandler(async (req, res) => {
	const { playerId } = req.params;
	const logs = await PlayerLog.find({ player_id: playerId })
		.populate("candidate_id", "candidate_id gender position education workExperience skills")
		.populate("opponent_candidate_id", "candidate_id gender position education workExperience skills")
		.sort({ timestamp: -1 });
	res.json(logs);
});

export const getLogsByCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const logs = await PlayerLog.find({ candidate_id: candidateId })
		.populate("candidate_id", "candidate_id gender position education workExperience skills")
		.populate("opponent_candidate_id", "candidate_id gender position education workExperience skills")
		.sort({ timestamp: -1 });
	res.json(logs);
});

export const getLogsWithCandidateDetails = asyncHandler(async (req, res) => {
	const logs = await PlayerLog.aggregate([
		{
			$lookup: {
				from: "candidates",
				localField: "candidate_id",
				foreignField: "candidate_id",
				as: "candidate_details",
			},
		},
		{
			$lookup: {
				from: "candidates",
				localField: "opponent_candidate_id",
				foreignField: "candidate_id",
				as: "opponent_details",
			},
		},
		{
			$unwind: {
				path: "$candidate_details",
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$unwind: {
				path: "$opponent_details",
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$sort: { timestamp: -1 },
		},
	]);
	
	res.json(logs);
});

export const getAnalytics = asyncHandler(async (req, res) => {
	const analytics = await PlayerLog.aggregate([
		{
			$group: {
				_id: null,
				totalLogs: { $sum: 1 },
				averageTimeTaken: { $avg: "$time_taken" },
				uniquePlayers: { $addToSet: "$player_id" },
				uniqueCandidates: { $addToSet: "$candidate_id" },
				tabViewCounts: { $push: "$tabs_viewed" },
			},
		},
		{
			$project: {
				totalLogs: 1,
				averageTimeTaken: { $round: ["$averageTimeTaken", 2] },
				uniquePlayerCount: { $size: "$uniquePlayers" },
				uniqueCandidateCount: { $size: "$uniqueCandidates" },
				mostViewedTabs: {
					$reduce: {
						input: "$tabViewCounts",
						initialValue: {},
						in: {
							$mergeObjects: [
								"$$value",
								{
									$arrayToObject: {
										$map: {
											input: "$$this",
											as: "tab",
											in: { k: "$$tab", v: { $add: [{ $ifNull: [{ $getField: { field: "$$tab", input: "$$value" } }, 0] }, 1] } },
										},
									},
								},
							],
						},
					},
				},
			},
		},
	]);
	
	const result = analytics[0] || {
		totalLogs: 0,
		averageTimeTaken: 0,
		uniquePlayerCount: 0,
		uniqueCandidateCount: 0,
		mostViewedTabs: {},
	};
	
	res.json(result);
});