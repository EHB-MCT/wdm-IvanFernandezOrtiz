export const validateLogInput = (req, res, next) => {
	const {
		player_id,
		candidate_id,
		candidate_gender,
		candidate_position,
		candidate_education,
		candidate_workExperience,
		candidate_skills,
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

	if (!candidate_gender || typeof candidate_gender !== "string") {
		errors.push("candidate_gender is required and must be a string");
	}

	if (!candidate_position || typeof candidate_position !== "string") {
		errors.push("candidate_position is required and must be a string");
	}

	if (!candidate_education || typeof candidate_education !== "string") {
		errors.push("candidate_education is required and must be a string");
	}

	if (!candidate_workExperience || typeof candidate_workExperience !== "string") {
		errors.push("candidate_workExperience is required and must be a string");
	}

	if (!candidate_skills || !Array.isArray(candidate_skills)) {
		errors.push("candidate_skills is required and must be an array");
	} else if (candidate_skills.some(skill => typeof skill !== "string")) {
		errors.push("All candidate_skills must be strings");
	}

	if (!tabs_viewed || !Array.isArray(tabs_viewed)) {
		errors.push("tabs_viewed is required and must be an array");
	} else if (tabs_viewed.some(tab => typeof tab !== "string")) {
		errors.push("All tabs_viewed must be strings");
	}

	if (time_taken === undefined || typeof time_taken !== "number" || time_taken < 0) {
		errors.push("time_taken is required and must be a non-negative number");
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