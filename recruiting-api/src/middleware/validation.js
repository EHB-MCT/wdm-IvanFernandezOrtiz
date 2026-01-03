const TAB_TYPES = ["PROFILE", "SKILLS", "WORK", "EDUCATION"];

export const validateLogInput = (req, res, next) => {
	const {
		player_id,
		chosen_candidate_id,
		rejected_candidate_id,
		position,
		tabs_viewed,
		time_taken,
		round_number,
	} = req.body;

	const errors = [];

	if (!player_id || typeof player_id !== "string") {
		errors.push("player_id is required and must be a string");
	}

	if (!chosen_candidate_id || typeof chosen_candidate_id !== "string") {
		errors.push("chosen_candidate_id is required and must be a string");
	}

	if (rejected_candidate_id && typeof rejected_candidate_id !== "string") {
		errors.push("rejected_candidate_id must be a string if provided");
	}

	if (!position || typeof position !== "string") {
		errors.push("position is required and must be a string");
	}

	if (!tabs_viewed || !Array.isArray(tabs_viewed)) {
		errors.push("tabs_viewed is required and must be an array");
	} else {
		const invalidTabs = tabs_viewed.filter(tab => !TAB_TYPES.includes(tab));
		if (invalidTabs.length > 0) {
			errors.push(`Invalid tabs_viewed values: ${invalidTabs.join(", ")}. Must be one of: ${TAB_TYPES.join(", ")}`);
		}
	}

	if (time_taken === undefined || typeof time_taken !== "number") {
		errors.push("time_taken is required and must be a number");
	} else if (!Number.isFinite(time_taken)) {
		errors.push("time_taken must be a valid finite number");
	} else if (time_taken < 0) {
		errors.push("time_taken cannot be negative");
	}

	if (round_number === undefined || typeof round_number !== "number") {
		errors.push("round_number is required and must be a number");
	} else if (!Number.isInteger(round_number) || round_number < 1) {
		errors.push("round_number must be a positive integer");
	}

	if (errors.length > 0) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors,
		});
	}

	next();
};

export const validateBatchChoiceInput = (req, res, next) => {
	const { choices } = req.body;
	const errors = [];

	if (!choices || !Array.isArray(choices)) {
		errors.push("choices field is required and must be an array");
	} else if (choices.length === 0) {
		errors.push("choices array cannot be empty");
	} else if (choices.length > 100) {
		errors.push("Cannot process more than 100 choices in a single batch");
	} else {
		choices.forEach((choice, index) => {
			const choiceErrors = [];
			
			if (!choice.player_id || typeof choice.player_id !== "string") {
				choiceErrors.push("player_id is required and must be a string");
			}

			if (!choice.chosen_candidate_id || typeof choice.chosen_candidate_id !== "string") {
				choiceErrors.push("chosen_candidate_id is required and must be a string");
			}

			if (choice.rejected_candidate_id && typeof choice.rejected_candidate_id !== "string") {
				choiceErrors.push("rejected_candidate_id must be a string if provided");
			}

			if (!choice.position || typeof choice.position !== "string") {
				choiceErrors.push("position is required and must be a string");
			}

			if (!choice.tabs_viewed || !Array.isArray(choice.tabs_viewed)) {
				choiceErrors.push("tabs_viewed is required and must be an array");
			} else {
				const invalidTabs = choice.tabs_viewed.filter(tab => !TAB_TYPES.includes(tab));
				if (invalidTabs.length > 0) {
					choiceErrors.push(`Invalid tabs_viewed values: ${invalidTabs.join(", ")}. Must be one of: ${TAB_TYPES.join(", ")}`);
				}
			}

			if (choice.time_taken === undefined || typeof choice.time_taken !== "number") {
				choiceErrors.push("time_taken is required and must be a number");
			} else if (!Number.isFinite(choice.time_taken)) {
				choiceErrors.push("time_taken must be a valid finite number");
			} else if (choice.time_taken < 0) {
				choiceErrors.push("time_taken cannot be negative");
			}

			if (choice.round_number === undefined || typeof choice.round_number !== "number") {
				choiceErrors.push("round_number is required and must be a number");
			} else if (!Number.isInteger(choice.round_number) || choice.round_number < 1) {
				choiceErrors.push("round_number must be a positive integer");
			}

			if (choiceErrors.length > 0) {
				errors.push(`Choice at index ${index}: ${choiceErrors.join(", ")}`);
			}
		});
	}

	if (errors.length > 0) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors,
		});
	}

	next();
};

export const validateCandidateInput = (req, res, next) => {
	const {
		candidate_id,
		gender,
		position,
		education,
		workExperience,
		skills,
	} = req.body;

	const errors = [];
	const GENDERS = ["male", "female", "other"];

	if (!candidate_id || typeof candidate_id !== "string") {
		errors.push("candidate_id is required and must be a string");
	}

	if (!gender || typeof gender !== "string") {
		errors.push("gender is required and must be a string");
	} else if (!GENDERS.includes(gender.toLowerCase())) {
		errors.push(`gender must be one of: ${GENDERS.join(", ")}`);
	}

	if (!position || typeof position !== "string") {
		errors.push("position is required and must be a string");
	}

	if (!education || typeof education !== "string") {
		errors.push("education is required and must be a string");
	}

	if (!workExperience || typeof workExperience !== "string") {
		errors.push("workExperience is required and must be a string");
	}

	if (!skills || !Array.isArray(skills)) {
		errors.push("skills is required and must be an array");
	} else if (skills.some(skill => typeof skill !== "string")) {
		errors.push("All skills must be strings");
	} else if (skills.length === 0) {
		errors.push("skills array cannot be empty");
	}

	if (errors.length > 0) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors,
		});
	}

	next();
};

export const validateIdParam = (paramName = "id") => {
	return (req, res, next) => {
		const id = req.params[paramName];
		
		if (!id || typeof id !== "string") {
			return res.status(400).json({
				error: `Invalid ${paramName}`,
				message: `${paramName} is required and must be a string`,
			});
		}
		
		next();
	};
};

export const validateSessionChoice = (req, res, next) => {
	const {
		round_number,
		chosen_candidate_id,
		rejected_candidate_id,
		position,
		tabs_viewed,
		time_taken,
	} = req.body;
	
	const errors = [];
	
	if (!chosen_candidate_id || typeof chosen_candidate_id !== "string") {
		errors.push("chosen_candidate_id is required and must be a string");
	}
	
	if (!rejected_candidate_id || typeof rejected_candidate_id !== "string") {
		errors.push("rejected_candidate_id is required and must be a string");
	}
	
	if (!position || typeof position !== "string") {
		errors.push("position is required and must be a string");
	}
	
	if (!tabs_viewed || !Array.isArray(tabs_viewed)) {
		errors.push("tabs_viewed is required and must be an array");
	} else {
		const invalidTabs = tabs_viewed.filter(tab => !TAB_TYPES.includes(tab));
		if (invalidTabs.length > 0) {
			errors.push(`Invalid tabs_viewed values: ${invalidTabs.join(", ")}. Must be one of: ${TAB_TYPES.join(", ")}`);
		}
	}
	
	if (time_taken === undefined || typeof time_taken !== "number") {
		errors.push("time_taken is required and must be a number");
	} else if (!Number.isFinite(time_taken)) {
		errors.push("time_taken must be a valid finite number");
	} else if (time_taken < 0) {
		errors.push("time_taken cannot be negative");
	}
	
	if (round_number === undefined || typeof round_number !== "number") {
		errors.push("round_number is required and must be a number");
	} else if (!Number.isInteger(round_number) || round_number < 1 || round_number > 10) {
		errors.push("round_number must be a positive integer between 1 and 10");
	}
	
	if (errors.length > 0) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors,
		});
	}
	
	next();
};