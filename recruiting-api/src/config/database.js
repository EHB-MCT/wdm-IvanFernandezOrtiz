import mongoose from "mongoose";

export const connectDatabase = async () => {
	try {
		const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/recruiting";
		
		if (!mongoUri) {
			console.warn("MONGO_URI not found, using default: mongodb://localhost:27017/recruiting");
		}

		await mongoose.connect(mongoUri, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		console.log("Connected to MongoDB successfully");
		
		mongoose.connection.on("error", (error) => {
			console.error("MongoDB connection error:", error);
		});

		mongoose.connection.on("disconnected", () => {
			console.log("MongoDB disconnected");
		});

		mongoose.connection.on("reconnected", () => {
			console.log("MongoDB reconnected");
		});

	} catch (error) {
		console.error("Failed to connect to MongoDB:", error);
		console.log("⚠️  Starting API without database connection for development...");
		// Don't exit, continue without database for development
	}
};

export const disconnectDatabase = async () => {
	try {
		await mongoose.disconnect();
		console.log("Disconnected from MongoDB");
	} catch (error) {
		console.error("Error disconnecting from MongoDB:", error);
	}
};