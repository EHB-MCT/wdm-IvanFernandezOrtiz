const TAB_TYPES = ["PROFILE", "SKILLS", "WORK", "EDUCATION"];

export const validateLogInput = (req, res, next) => {
	const {
		player_id,
		candidate_id,
		opponent_candidate_id,
		tabs_viewed,
		time_taken,
	} = req.body;

	const errors = [];

	if (!player_id || typeof player_id !== "string") {
		errors.push("player_id is required and must be a string");
	}

	if (!candidate_id || typeof candidate_id !== "string") {
		errors.push("candidate_id is required and must be a string");
	}

	if (opponent_candidate_id && typeof opponent_candidate_id !== "string") {
		errors.push("opponent_candidate_id must be a string if provided");
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

	if (errors.length > 0) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors,
		});
	}

	next();
};

export const validateBatchLogInput = (req, res, next) => {
	const { logs } = req.body;
	const errors = [];

	if (!logs || !Array.isArray(logs)) {
		errors.push("logs field is required and must be an array");
	} else if (logs.length === 0) {
		errors.push("logs array cannot be empty");
	} else if (logs.length > 100) {
		errors.push("Cannot process more than 100 logs in a single batch");
	} else {
		logs.forEach((log, index) => {
			const logErrors = [];
			
			if (!log.player_id || typeof log.player_id !== "string") {
				logErrors.push("player_id is required and must be a string");
			}

			if (!log.candidate_id || typeof log.candidate_id !== "string") {
				logErrors.push("candidate_id is required and must be a string");
			}

			if (log.opponent_candidate_id && typeof log.opponent_candidate_id !== "string") {
				logErrors.push("opponent_candidate_id must be a string if provided");
			}

			if (!log.tabs_viewed || !Array.isArray(log.tabs_viewed)) {
				logErrors.push("tabs_viewed is required and must be an array");
			} else {
				const invalidTabs = log.tabs_viewed.filter(tab => !TAB_TYPES.includes(tab));
				if (invalidTabs.length > 0) {
					logErrors.push(`Invalid tabs_viewed values: ${invalidTabs.join(", ")}. Must be one of: ${TAB_TYPES.join(", ")}`);
				}
			}

			if (log.time_taken === undefined || typeof log.time_taken !== "number") {
				logErrors.push("time_taken is required and must be a number");
			} else if (!Number.isFinite(log.time_taken)) {
				logErrors.push("time_taken must be a valid finite number");
			} else if (log.time_taken < 0) {
				logErrors.push("time_taken cannot be negative");
			}

			if (logErrors.length > 0) {
				errors.push(`Log at index ${index}: ${logErrors.join(", ")}`);
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