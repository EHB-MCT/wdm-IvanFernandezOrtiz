import { ChoiceService } from "../services/choiceService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { parseQueryParams } from "../utils/responseHelpers.js";

export const createChoice = asyncHandler(async (req, res) => {
	const choice = await ChoiceService.createChoice(req.body);
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
	
	const savedChoices = await ChoiceService.createBatchChoices(choices);
	res.status(201).json({ 
		status: "ok", 
		created: savedChoices.length,
		ids: savedChoices.map(choice => choice._id)
	});
});

export const getAllChoices = asyncHandler(async (req, res) => {
	const { limit, offset } = parseQueryParams(req);
	const choices = await ChoiceService.getAllChoices(limit, offset);
	res.json(choices);
});

export const getChoicesByPlayer = asyncHandler(async (req, res) => {
	const { playerId } = req.params;
	const { limit } = parseQueryParams(req);
	const choices = await ChoiceService.getChoicesByPlayer(playerId, limit);
	res.json(choices);
});

export const getChoicesByCandidate = asyncHandler(async (req, res) => {
	const { candidateId } = req.params;
	const { limit } = parseQueryParams(req);
	const choices = await ChoiceService.getChoicesByCandidate(candidateId, limit);
	res.json(choices);
});

export const getChoicesWithCandidateDetails = asyncHandler(async (req, res) => {
	const { limit, offset } = parseQueryParams(req);
	const choices = await ChoiceService.getAllChoices(limit, offset);
	res.json(choices);
});

export const getChoiceAnalytics = asyncHandler(async (req, res) => {
	const analytics = await ChoiceService.getChoiceAnalytics();
	res.json(analytics);
});

export const clearAllChoices = asyncHandler(async (req, res) => {
	const result = await ChoiceService.clearAllChoices();
	res.json({ 
		status: "ok", 
		deleted: result.deletedCount,
		message: `Successfully deleted ${result.deletedCount} choices`
	});
});