import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Mongo connection
const mongoUri = process.env.MONGO_URI;
await mongoose.connect(mongoUri);
console.log("Connected to MongoDB");

// Schema
const PlayerLog = mongoose.model(
	"PlayerLog",
	new mongoose.Schema({
		player_id: String,
		candidate_id: String,
		time_taken: Number,
		first_tab: String,
		tabs_viewed: [String],
		timestamp: { type: Date, default: Date.now },
	})
);

// POST endpoint
app.post("/api/log", async (req, res) => {
	try {
		const log = new PlayerLog(req.body);
		await log.save();
		res.status(201).json({ status: "ok" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to save log" });
	}
});

// Health check
app.get("/", (req, res) => res.send("Recruiting API running on path ... "));

const port = process.env.PORT;
app.listen(port, () => console.log(`API listening on port ${port}`));

app.get("/api/log", async (req, res) => {
	try {
		const data = await mongoose.connection.db.collection("playerlogs").find({}).toArray();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch logs" });
	}
});
