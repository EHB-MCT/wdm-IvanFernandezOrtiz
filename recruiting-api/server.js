import express from "express";
import cors from "cors";
import { connectDatabase } from "./src/config/database.js";
import { swaggerUi, specs } from "./src/config/swagger.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import logRoutes from "./src/routes/logRoutes.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
	res.send("Recruiting API running");
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use("/api/log", logRoutes);
app.use("/api/candidates", candidateRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
	try {
		await connectDatabase();
		
		const port = process.env.PORT || 5000;
		app.listen(port, () => {
			console.log(`API listening on port ${port}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("SIGTERM received, shutting down gracefully");
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("SIGINT received, shutting down gracefully");
	process.exit(0);
});

startServer();
