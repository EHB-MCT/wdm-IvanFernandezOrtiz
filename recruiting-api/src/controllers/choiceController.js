import { asyncHandler } from "../middleware/errorHandler.js";
import { parseQueryParams } from "../utils/responseHelpers.js";
import PlayerSession from "../models/PlayerSession.js";

export const createChoice = asyncHandler(async (req, res) => {
	const { player_id, round_number, chosen_candidate_id, rejected_candidate_id, position, time_taken, tabs_viewed } = req.body;
	
	try {
		// Find the most recent active session for this player
		let activeSession = await PlayerSession.findOne({ 
			player_id, 
			status: "active" 
		}).sort({ start_time: -1 });
		
		// Only create a new session if no active session exists
		if (!activeSession) {
			const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			
			activeSession = await PlayerSession.create({
				session_id,
				player_id,
				choices: [],
				max_rounds: 10,
				status: "active",
				start_time: new Date()
			});
		}
		
		// Check if round already exists in this session
		const existingChoice = activeSession.choices.find(c => c.round_number === round_number);
		if (existingChoice) {
			return res.status(400).json({
				error: "Round already completed",
				message: `Round ${round_number} has already been completed for session ${activeSession.session_id}`
			});
		}
		
		// Create the choice object
		const newChoice = {
			round_number,
			chosen_candidate_id,
			rejected_candidate_id,
			position,
			time_taken,
			tabs_viewed,
			timestamp: new Date()
		};
		
		// Add choice to session
		activeSession.choices.push(newChoice);
		
		// Update session status if max rounds reached
		if (activeSession.choices.length >= activeSession.max_rounds) {
			activeSession.status = "completed";
			activeSession.end_time = new Date();
		}
		
		// Save the session with the new choice
		await activeSession.save();
		
		// Return success with session info
		res.status(201).json({ 
			status: "ok", 
			session_id: activeSession.session_id,
			round_completed: round_number,
			total_rounds: activeSession.choices.length,
			session_status: activeSession.status,
			message: `Choice saved to session ${activeSession.session_id}`
		});
		
	} catch (error) {
		console.error("Error saving choice to session:", error);
		res.status(500).json({
			error: "Failed to save choice to session",
			message: error.message
		});
	}
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
	
	// For batch choices, we'd need to create sessions or add to existing sessions
	// For now, return success without processing
	res.status(201).json({ 
		status: "ok", 
		message: "Batch choices received (not fully implemented for session-based structure)"
	});
});

export const getAllChoices = asyncHandler(async (req, res) => {
	const { limit, offset } = parseQueryParams(req);
	
	// Get choices from sessions
	const sessions = await PlayerSession.aggregate([
		{ $unwind: "$choices" },
		{ $sort: { "choices.timestamp": -1 } },
		{ $skip: offset || 0 },
		{ $limit: limit || 100 },
		{
			$project: {
				_id: "$choices._id",
				session_id: 1,
				player_id: 1,
				chosen_candidate_id: "$choices.chosen_candidate_id",
				rejected_candidate_id: "$choices.rejected_candidate_id",
				position: "$choices.position",
				time_taken: "$choices.time_taken",
				tabs_viewed: "$choices.tabs_viewed",
				round_number: "$choices.round_number",
				timestamp: "$choices.timestamp"
			}
		}
	]);
	
	res.json(sessions);
});

export const getChoicesByPlayer = asyncHandler(async (req, res) => {
	const { playerId } = req.params;
	const { limit } = parseQueryParams(req);
	
	// Get player's sessions with choices
	const sessions = await PlayerSession.aggregate([
		{ $match: { player_id: playerId } },
		{ $unwind: "$choices" },
		{ $sort: { "choices.timestamp": -1 } },
		{ $limit: limit || 100 },
		{
			$project: {
				_id: "$choices._id",
				session_id: 1,
				player_id: 1,
				chosen_candidate_id: "$choices.chosen_candidate_id",
				rejected_candidate_id: "$choices.rejected_candidate_id",
				position: "$choices.position",
				time_taken: "$choices.time_taken",
				tabs_viewed: "$choices.tabs_viewed",
				round_number: "$choices.round_number",
				timestamp: "$choices.timestamp"
			}
		}
	]);
	
	res.json(sessions);
});

export const getChoicesByCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const { limit } = parseQueryParams(req);
	
	// Get choices where candidate was chosen or rejected
	const sessions = await PlayerSession.aggregate([
		{ $unwind: "$choices" },
		{ $match: { 
			$or: [
				{ "choices.chosen_candidate_id": candidateId },
				{ "choices.rejected_candidate_id": candidateId }
			]
		}},
		{ $sort: { "choices.timestamp": -1 } },
		{ $limit: limit || 100 },
		{
			$project: {
				_id: "$choices._id",
				session_id: 1,
				player_id: 1,
				chosen_candidate_id: "$choices.chosen_candidate_id",
				rejected_candidate_id: "$choices.rejected_candidate_id",
				position: "$choices.position",
				time_taken: "$choices.time_taken",
				tabs_viewed: "$choices.tabs_viewed",
				round_number: "$choices.round_number",
				timestamp: "$choices.timestamp"
			}
		}
	]);
	
	res.json(sessions);
});

export const getChoicesWithCandidateDetails = asyncHandler(async (req, res) => {
	const { limit, offset } = parseQueryParams(req);
	
	// Get all choices with candidate details populated
	const sessions = await PlayerSession.aggregate([
		{ $unwind: "$choices" },
		{ $lookup: {
			from: 'candidates',
			localField: 'choices.chosen_candidate_id',
			foreignField: 'candidate_id',
			as: 'chosen_details'
		}},
		{ $lookup: {
			from: 'candidates',
			localField: 'choices.rejected_candidate_id',
			foreignField: 'candidate_id',
			as: 'rejected_details'
		}},
		{ $sort: { "choices.timestamp": -1 } },
		{ $skip: offset || 0 },
		{ $limit: limit || 100 },
		{
			$project: {
				_id: "$choices._id",
				session_id: 1,
				player_id: 1,
				chosen_candidate_id: "$choices.chosen_candidate_id",
				rejected_candidate_id: "$choices.rejected_candidate_id",
				position: "$choices.position",
				time_taken: "$choices.time_taken",
				tabs_viewed: "$choices.tabs_viewed",
				round_number: "$choices.round_number",
				timestamp: "$choices.timestamp",
				chosen_details: 1,
				rejected_details: 1
			}
		}
	]);
	
	res.json(sessions);
});

export const getChoiceAnalytics = asyncHandler(async (req, res) => {
	// Get analytics from sessions
	const analytics = await PlayerSession.aggregate([
		{ $unwind: "$choices" },
		{ $group: {
			_id: null,
			totalChoices: { $sum: 1 },
			uniquePlayers: { $addToSet: "$player_id" },
			totalSessions: { $addToSet: "$session_id" },
			avgTimePerChoice: { $avg: "$choices.time_taken" },
			totalTime: { $sum: "$choices.time_taken" },
			maxRoundsPlayed: { $max: "$choices.round_number" },
			choicesByRound: { $push: { round: "$choices.round_number", count: { $sum: 1 } } }
		}}
	]);
	
	res.json(analytics[0] || {});
});

export const clearAllChoices = asyncHandler(async (req, res) => {
	// Clear all session data
	const result = await PlayerSession.deleteMany({});
	
	res.json({ 
		status: "ok", 
		deleted: result.deletedCount,
		message: "All session data cleared"
	});
});