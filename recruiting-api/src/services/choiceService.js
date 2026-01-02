import PlayerChoices from "../models/PlayerChoices.js";
import Candidate from "../models/Candidate.js";
import { validateLimit, validateOffset } from "../utils/responseHelpers.js";

export class ChoiceService {
    static async createChoice(choiceData) {
        const choice = new PlayerChoices(choiceData);
        await choice.save();
        return choice;
    }

    static async createBatchChoices(choicesData) {
        const savedChoices = await PlayerChoices.insertMany(choicesData);
        return savedChoices;
    }

    static async getAllChoices(limit = 100, offset = 0) {
        const validLimit = validateLimit(limit);
        const validOffset = validateOffset(offset);
        return await PlayerChoices.find()
            .sort({ timestamp: -1 })
            .limit(validLimit)
            .skip(validOffset);
    }

    static async getChoicesByPlayer(playerId, limit = 100) {
        const validLimit = validateLimit(limit);
        return await PlayerChoices.find({ player_id: playerId })
            .sort({ timestamp: -1 })
            .limit(validLimit);
    }

    static async getChoicesByCandidate(candidateId, limit = 100) {
        const validLimit = validateLimit(limit);
        return await PlayerChoices.find({ 
            $or: [
                { chosen_candidate_id: candidateId },
                { rejected_candidate_id: candidateId }
            ]
        })
        .sort({ timestamp: -1 })
        .limit(validLimit);
    }

    static async getChoiceAnalytics() {
        const choices = await PlayerChoices.find();
        
        if (choices.length === 0) {
            return {
                totalChoices: 0,
                averageTimeTaken: 0,
                uniquePlayerCount: 0,
                uniqueCandidateCount: 0,
                mostViewedTabs: { PROFILE: 0, SKILLS: 0, WORK: 0, EDUCATION: 0 },
                popularPositions: []
            };
        }

        const totalChoices = choices.length;
        const averageTimeTaken = choices.reduce((sum, choice) => sum + choice.time_taken, 0) / totalChoices;
        const uniquePlayers = new Set(choices.map(choice => choice.player_id));
        const uniqueCandidates = new Set(choices.map(choice => choice.chosen_candidate_id));
        
        const tabCounts = { PROFILE: 0, SKILLS: 0, WORK: 0, EDUCATION: 0 };
        choices.forEach(choice => {
            choice.tabs_viewed.forEach(tab => {
                if (tabCounts.hasOwnProperty(tab)) {
                    tabCounts[tab]++;
                }
            });
        });
        
        const positionCounts = {};
        choices.forEach(choice => {
            positionCounts[choice.position] = (positionCounts[choice.position] || 0) + 1;
        });
        
        const popularPositions = Object.entries(positionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([position, count]) => ({ position, count }));

return {
            totalChoices,
            averageTimeTaken: Math.round(averageTimeTaken * 100) / 100,
            uniquePlayerCount: uniquePlayers.size,
            uniqueCandidateCount: uniqueCandidates.size,
            mostViewedTabs: tabCounts,
            popularPositions
        };
    }

    static async clearAllChoices() {
        return await PlayerChoices.deleteMany({});
    }
}