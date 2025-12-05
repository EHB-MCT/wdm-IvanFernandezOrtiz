import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Recruiting API",
			version: "1.0.0",
			description: "API for logging and retrieving player interaction data from a recruiting game",
			contact: {
				name: "API Support",
				email: "support@example.com",
			},
		},
		servers: [
			{
				url: process.env.API_URL || "http://localhost:5000",
				description: "Development server",
			},
		],
		tags: [
			{
				name: "Logs",
				description: "Player log management",
			},
			{
				name: "Candidates",
				description: "Candidate management",
			},
			{
				name: "Choices",
				description: "Player choice management",
			},
		],
		components: {
			schemas: {
				PlayerChoice: {
					type: "object",
					required: ["player_id", "chosen_candidate_id", "position", "time_taken", "tabs_viewed", "round_number"],
					properties: {
						player_id: { type: "string", description: "Unique identifier for the player" },
							chosen_candidate_id: { type: "string", description: "ID of the chosen candidate" },
							rejected_candidate_id: { type: "string", description: "ID of the rejected candidate" },
							position: { type: "string", description: "Position being recruited for" },
							time_taken: { type: "number", minimum: 0, description: "Time taken to make decision in seconds" },
							tabs_viewed: {
								type: "array",
								items: { type: "string", enum: ["PROFILE", "SKILLS", "WORK", "EDUCATION"] },
								description: "Tabs the player viewed during the decision"
							},
							round_number: { type: "number", description: "Round number in the game" }
					}
				},
						candidate_id: {
							type: "string",
							description: "Unique identifier for selected candidate",
							example: "candidate456"
						},
						opponent_candidate_id: {
							type: "string",
							description: "Unique identifier for opponent candidate (optional)",
							example: "candidate789"
						},
						tabs_viewed: {
							type: "array",
							items: {
								type: "string",
								enum: ["PROFILE", "SKILLS", "WORK", "EDUCATION"]
							},
							description: "List of tabs the player viewed",
							example: ["PROFILE", "SKILLS", "WORK"]
						},
						time_taken: {
							type: "number",
							minimum: 0,
							description: "Time taken by the player in seconds (must be non-negative)",
							example: 45.5
						},
						timestamp: {
							type: "string",
							format: "date-time",
							description: "When the log was created (automatically set)",
							example: "2023-12-05T10:30:00.000Z"
						},
						_id: {
							type: "string",
							description: "MongoDB document ID",
							example: "64a1b2c3d4e5f678901234567"
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Document creation timestamp"
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "Document last update timestamp"
						}
					}
				},
				Candidate: {
					type: "object",
					required: ["candidate_id", "gender", "position", "education", "workExperience", "skills"],
					properties: {
						candidate_id: {
							type: "string",
							description: "Unique identifier for candidate",
							example: "candidate456"
						},
						gender: {
							type: "string",
							enum: ["male", "female", "other"],
							description: "Gender of candidate",
							example: "female"
						},
						position: {
							type: "string",
							description: "Position the candidate is applying for",
							example: "Software Developer"
						},
						education: {
							type: "string",
							description: "Education level of the candidate",
							example: "Bachelor's in Computer Science"
						},
						workExperience: {
							type: "string",
							description: "Work experience of the candidate",
							example: "5 years in web development"
						},
						skills: {
							type: "array",
							items: {
								type: "string"
							},
							description: "List of candidate skills",
							example: ["JavaScript", "React", "Node.js", "MongoDB"]
						},
						_id: {
							type: "string",
							description: "MongoDB document ID",
							example: "64a1b2c3d4e5f678901234567"
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "Document creation timestamp"
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "Document last update timestamp"
						}
					}
				},
				ErrorResponse: {
					type: "object",
					properties: {
						error: {
							type: "string",
							description: "Error type or message",
							example: "Validation failed"
						},
						details: {
							type: "array",
							items: {
								type: "string"
							},
							description: "Array of specific error messages",
							example: ["time_taken cannot be negative", "Invalid tabs_viewed values"]
						}
					}
				},
				SuccessResponse: {
					type: "object",
					properties: {
						status: {
							type: "string",
							description: "Success status",
							example: "ok"
						},
						message: {
							type: "string",
							description: "Success message",
							example: "Operation completed successfully"
						}
					}
				}
			}
		},
	},
	apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };