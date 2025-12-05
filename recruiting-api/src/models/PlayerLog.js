import mongoose from "mongoose";

const TAB_TYPES = ["CV", "LINKEDIN", "PORTFOLIO", "SKILLS", "EXPERIENCE", "EDUCATION"];

const PlayerLogSchema = new mongoose.Schema(
	{
		player_id: { type: String, required: true },
		candidate_id: { type: String, required: true, ref: "Candidate" },
		opponent_candidate_id: { type: String, ref: "Candidate" },
		tabs_viewed: [{ 
			type: String, 
			required: true,
			enum: TAB_TYPES,
			message: `Invalid tab type. Must be one of: ${TAB_TYPES.join(", ")}`
		}],
		time_taken: { 
			type: Number, 
			required: true,
			min: [0, "time_taken cannot be negative"],
			validate: {
				validator: Number.isFinite,
				message: "time_taken must be a valid number"
			}
		},
		timestamp: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
		collection: "playerlogs",
	}
);

PlayerLogSchema.index({ player_id: 1 });
PlayerLogSchema.index({ candidate_id: 1 });
PlayerLogSchema.index({ opponent_candidate_id: 1 });
PlayerLogSchema.index({ timestamp: -1 });

PlayerLogSchema.pre("save", async function(next) {
	const Candidate = mongoose.model("Candidate");
	
	if (this.candidate_id) {
		const candidate = await Candidate.findOne({ candidate_id: this.candidate_id });
		if (!candidate) {
			return next(new Error(`Candidate with ID ${this.candidate_id} does not exist`));
		}
	}
	
	if (this.opponent_candidate_id) {
		const opponent = await Candidate.findOne({ candidate_id: this.opponent_candidate_id });
		if (!opponent) {
			return next(new Error(`Opponent candidate with ID ${this.opponent_candidate_id} does not exist`));
		}
	}
	
	next();
});

export default mongoose.model("PlayerLog", PlayerLogSchema);