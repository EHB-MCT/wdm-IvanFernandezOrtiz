import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./src/config/database.js";
import { swaggerUi, specs } from "./src/config/swagger.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";
import choiceRoutes from "./src/routes/choiceRoutes.js";
import { config, validateConfig } from "./src/config/config.js";

// Load environment variables
dotenv.config();

const app = express();

// Validate configuration before starting
if (!validateConfig()) {
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use("/api/candidates", candidateRoutes);
app.use("/api/choices", choiceRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
	try {
		await connectDatabase();
		
		app.listen(config.port, () => {
			console.log(`🚀 API server started successfully!`);
			console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
			console.log(`🔗 API URL: ${config.apiUrl}`);
			console.log(`📊 Database: ${config.mongo.uri.replace(/\/\/.*@/, '//***:***@')}`);
			console.log(`📡 Health check: http://localhost:${config.port}/`);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
};

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("🛑 SIGTERM received, shutting down gracefully");
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("🛑 SIGINT received, shutting down gracefully");
	process.exit(0);
});

startServer();
