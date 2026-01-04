import mongoose from "mongoose";

const TAB_TYPES = ["PROFILE", "SKILLS", "WORK", "EDUCATION"];

const PlayerChoicesSchema = new mongoose.Schema(
	{
		player_id: { type: String, required: true, description: "Unique identifier for player" },
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
		round_number: { type: Number, required: true, description: "Round number in game" },
		timestamp: { type: Date, default: Date.now, description: "When choice was made" },
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

export default mongoose.model("PlayerChoices", PlayerChoicesSchema);