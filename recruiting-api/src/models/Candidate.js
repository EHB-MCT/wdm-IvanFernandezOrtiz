import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
	{
		candidate_id: { type: String, required: true },
		gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
		position: { type: String, required: true },
		education: { type: String, required: true },
		workExperience: { type: String, required: true },
		skills: [{ type: String, required: true }],
	},
	{
		timestamps: true,
		collection: "candidates",
	}
);

CandidateSchema.index({ candidate_id: 1 }, { unique: true });
CandidateSchema.index({ position: 1 });
CandidateSchema.index({ gender: 1 });

export default mongoose.model("Candidate", CandidateSchema);