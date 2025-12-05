import mongoose from "mongoose";

const PlayerLogSchema = new mongoose.Schema(
	{
		player_id: { type: String, required: true },
		candidate_id: { type: String, required: true },
		candidate_gender: { type: String, required: true },
		candidate_position: { type: String, required: true },
		candidate_education: { type: String, required: true },
		candidate_workExperience: { type: String, required: true },
		candidate_skills: [{ type: String, required: true }],
		tabs_viewed: [{ type: String, required: true }],
		time_taken: { type: Number, required: true },
		timestamp: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
		collection: "playerlogs",
	}
);

PlayerLogSchema.index({ player_id: 1 });
PlayerLogSchema.index({ candidate_id: 1 });
PlayerLogSchema.index({ timestamp: -1 });

export default mongoose.model("PlayerLog", PlayerLogSchema);