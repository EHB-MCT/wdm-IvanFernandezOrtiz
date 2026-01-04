import mongoose from "mongoose";

const TAB_TYPES = ["PROFILE", "SKILLS", "WORK", "EDUCATION"];

// Individual Choice Schema (embedded in PlayerSession)
const ChoiceSchema = new mongoose.Schema({
	round_number: { type: Number, required: true, description: "Round number in game (1-10)" },
	chosen_candidate_id: { type: String, required: true, ref: "Candidate", description: "ID of chosen candidate" },
	rejected_candidate_id: { type: String, ref: "Candidate", description: "ID of rejected candidate" },
	position: { type: String, required: true, description: "Position being recruited for" },
	time_taken: { 
		type: Number, 
		required: true,
		min: [0, "time_taken cannot be negative"],
		validate: {
			validator: Number.isFinite,
			message: "time_taken must be a valid number"
		},
		description: "Time taken to make decision in seconds"
	},
	tabs_viewed: [{ 
		type: String, 
		required: true,
		enum: TAB_TYPES,
		message: `Invalid tab type. Must be one of: ${TAB_TYPES.join(", ")}`
	}],
	timestamp: { type: Date, default: Date.now, description: "When choice was made" },
});

// Player Session Schema
const PlayerSessionSchema = new mongoose.Schema(
	{
		session_id: { type: String, required: true, description: "Unique session identifier" },
		player_id: { type: String, required: true, description: "Player identifier (can be same user for multiple sessions)" },
		choices: [ChoiceSchema],
		start_time: { type: Date, default: Date.now, description: "When session started" },
		end_time: { type: Date, description: "When session ended" },
		status: { 
			type: String, 
			enum: ["active", "completed", "abandoned"], 
			default: "active",
			description: "Session status"
		},
		total_rounds_completed: { type: Number, default: 0, description: "Number of rounds completed" },
		total_time_taken: { type: Number, default: 0, description: "Total time for all choices in seconds" },
		max_rounds: { type: Number, default: 10, description: "Maximum rounds for this session" },
	},
	{
		timestamps: true,
		collection: "playersessions",
	}
);

PlayerSessionSchema.index({ session_id: 1 });
PlayerSessionSchema.index({ player_id: 1 });
PlayerSessionSchema.index({ start_time: -1 });
PlayerSessionSchema.index({ status: 1 });

// Pre-save middleware to calculate totals
PlayerSessionSchema.pre("save", function(next) {
	if (this.isModified("choices")) {
		this.total_rounds_completed = this.choices.length;
		this.total_time_taken = this.choices.reduce((sum, choice) => sum + (choice.time_taken || 0), 0);
	}
	next();
});

export default mongoose.model("PlayerSession", PlayerSessionSchema);