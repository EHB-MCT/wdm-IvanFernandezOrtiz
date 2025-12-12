import mongoose from "mongoose";

const TAB_TYPES = ["PROFILE", "SKILLS", "WORK", "EDUCATION"];

const PlayerChoicesSchema = new mongoose.Schema(
	{
		player_id: { type: String, required: true, description: "Unique identifier for the player" },
		chosen_candidate_id: { type: String, required: true, ref: "Candidate", description: "ID of the chosen candidate" },
		rejected_candidate_id: { type: String, ref: "Candidate", description: "ID of the rejected candidate" },
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
		round_number: { type: Number, required: true, description: "Round number in the game" },
		timestamp: { type: Date, default: Date.now, description: "When the choice was made" },
	},
	{
		timestamps: true,
		collection: "playerchoices",
	}
);

PlayerChoicesSchema.index({ player_id: 1 });
PlayerChoicesSchema.index({ chosen_candidate_id: 1 });
PlayerChoicesSchema.index({ rejected_candidate_id: 1 });
PlayerChoicesSchema.index({ round_number: 1 });
PlayerChoicesSchema.index({ timestamp: -1 });

// Temporarily disabled pre-save validation to allow logging without database candidates
// Re-enable this once candidates are imported to database
/*
PlayerChoicesSchema.pre("save", async function(next) {
	const Candidate = mongoose.model("Candidate");
	
	if (this.chosen_candidate_id) {
		const chosen = await Candidate.findOne({ candidate_id: this.chosen_candidate_id });
		if (!chosen) {
			return next(new Error(`Chosen candidate with ID ${this.chosen_candidate_id} does not exist`));
		}
	}
	
	if (this.rejected_candidate_id) {
		const rejected = await Candidate.findOne({ candidate_id: this.rejected_candidate_id });
		if (!rejected) {
			return next(new Error(`Rejected candidate with ID ${this.rejected_candidate_id} does not exist`));
		}
	}
	
	next();
});
*/

export default mongoose.model("PlayerChoices", PlayerChoicesSchema);