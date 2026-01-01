import Candidate from "../models/Candidate.js";
import { validateLimit, validateOffset } from "../utils/responseHelpers.js";

export class CandidateService {
    static async getAllCandidates(limit = 100, offset = 0) {
        const validLimit = validateLimit(limit);
        const validOffset = validateOffset(offset);
        return await Candidate.find()
            .sort({ candidate_id: 1 })
            .limit(validLimit)
            .skip(validOffset);
    }

    static async getCandidateById(candidateId) {
        return await Candidate.findOne({ candidate_id: candidateId });
    }

    static async createCandidate(candidateData) {
        const candidate = new Candidate(candidateData);
        await candidate.save();
        return candidate;
    }

    static async updateCandidate(candidateId, updateData) {
        return await Candidate.findOneAndUpdate(
            { candidate_id: candidateId },
            updateData,
            { new: true, runValidators: true }
        );
    }

    static async deleteCandidate(candidateId) {
        return await Candidate.findOneAndDelete({ candidate_id: candidateId });
    }

    static async getCandidatesByPosition(position, limit = 100) {
        const validLimit = validateLimit(limit);
        return await Candidate.find({ position })
            .sort({ candidate_id: 1 })
            .limit(validLimit);
    }

    static async getCandidatesByGender(gender, limit = 100) {
        const validLimit = validateLimit(limit);
        return await Candidate.find({ gender })
            .sort({ candidate_id: 1 })
            .limit(validLimit);
    }

    static async createBatchCandidates(candidatesData) {
        const savedCandidates = await Candidate.insertMany(candidatesData);
        return savedCandidates;
    }
}