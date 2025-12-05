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
		],
	},
	apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };