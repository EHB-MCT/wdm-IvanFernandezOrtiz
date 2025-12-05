import PlayerLog from "../models/PlayerLog.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createLog = asyncHandler(async (req, res) => {
	const log = new PlayerLog(req.body);
	await log.save();
	res.status(201).json({ status: "ok", id: log._id });
});

export const getAllLogs = asyncHandler(async (req, res) => {
	const logs = await PlayerLog.find().sort({ timestamp: -1 });
	res.json(logs);
});

export const getLogsByPlayer = asyncHandler(async (req, res) => {
	const { playerId } = req.params;
	const logs = await PlayerLog.find({ player_id: playerId }).sort({ timestamp: -1 });
	res.json(logs);
});

export const getLogsByCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const logs = await PlayerLog.find({ candidate_id: candidateId }).sort({ timestamp: -1 });
	res.json(logs);
});