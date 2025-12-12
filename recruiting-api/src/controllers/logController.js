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
	// Temporarily disabled populate until candidates are imported to database
	const choices = await PlayerChoices.find()
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoicesByPlayer = asyncHandler(async (req, res) => {
	const { playerId } = req.params;
	// Temporarily disabled populate until candidates are imported to database
	const choices = await PlayerChoices.find({ player_id: playerId })
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoicesByCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	// Temporarily disabled populate until candidates are imported to database
	const choices = await PlayerChoices.find({ 
		$or: [
			{ chosen_candidate_id: candidateId },
			{ rejected_candidate_id: candidateId }
		]
	})
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoicesWithCandidateDetails = asyncHandler(async (req, res) => {
	// Temporarily disabled aggregation until candidates are imported to database
	const choices = await PlayerChoices.find()
		.sort({ timestamp: -1 });
	res.json(choices);
});

export const getChoiceAnalytics = asyncHandler(async (req, res) => {
	// Simplified analytics without candidate lookups until candidates are imported to database
	const choices = await PlayerChoices.find();
	
	if (choices.length === 0) {
		return res.json({
			totalChoices: 0,
			averageTimeTaken: 0,
			uniquePlayerCount: 0,
			uniqueCandidateCount: 0,
			mostViewedTabs: { PROFILE: 0, SKILLS: 0, WORK: 0, EDUCATION: 0 },
			popularPositions: []
		});
	}

	// Calculate basic analytics
	const totalChoices = choices.length;
	const averageTimeTaken = choices.reduce((sum, choice) => sum + choice.time_taken, 0) / totalChoices;
	const uniquePlayers = new Set(choices.map(choice => choice.player_id));
	const uniqueCandidates = new Set(choices.map(choice => choice.chosen_candidate_id));
	
	// Calculate tab views
	const tabCounts = { PROFILE: 0, SKILLS: 0, WORK: 0, EDUCATION: 0 };
	choices.forEach(choice => {
		choice.tabs_viewed.forEach(tab => {
			if (tabCounts.hasOwnProperty(tab)) {
				tabCounts[tab]++;
			}
		});
	});
	
	// Calculate position popularity
	const positionCounts = {};
	choices.forEach(choice => {
		positionCounts[choice.position] = (positionCounts[choice.position] || 0) + 1;
	});
	
	const popularPositions = Object.entries(positionCounts)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 10)
		.map(([position, count]) => ({ position, count }));

	res.json({
		totalChoices,
		averageTimeTaken: Math.round(averageTimeTaken * 100) / 100,
		uniquePlayerCount: uniquePlayers.size,
		uniqueCandidateCount: uniqueCandidates.size,
		mostViewedTabs: tabCounts,
		popularPositions
	});
});


