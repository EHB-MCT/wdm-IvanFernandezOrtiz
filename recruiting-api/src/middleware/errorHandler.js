export const errorHandler = (error, req, res, next) => {
	console.error("Error details:", {
		message: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		timestamp: new Date().toISOString(),
	});

	// Mongoose validation error
	if (error.name === "ValidationError") {
		const errors = Object.values(error.errors).map(err => err.message);
		return res.status(400).json({
			error: "Validation failed",
			details: errors,
		});
	}

	// Mongoose duplicate key error
	if (error.code === 11000) {
		return res.status(409).json({
			error: "Duplicate entry",
			message: "A record with this data already exists",
		});
	}

	// Mongoose cast error (invalid ObjectId)
	if (error.name === "CastError") {
		return res.status(400).json({
			error: "Invalid ID format",
			message: "The provided ID is not valid",
		});
	}

	// JWT errors
	if (error.name === "JsonWebTokenError") {
		return res.status(401).json({
			error: "Invalid token",
			message: "Authentication token is invalid",
		});
	}

	if (error.name === "TokenExpiredError") {
		return res.status(401).json({
			error: "Token expired",
			message: "Authentication token has expired",
		});
	}

	// Default error
	const statusCode = error.statusCode || 500;
	const message = process.env.NODE_ENV === "production" 
		? "Internal server error" 
		: error.message;

	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
	});
};

export const notFoundHandler = (req, res) => {
	res.status(404).json({
		error: "Route not found",
		message: `Cannot ${req.method} ${req.url}`,
	});
};

export const asyncHandler = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};