import { asyncHandler } from "../middleware/errorHandler.js";
import { parseQueryParams } from "../utils/responseHelpers.js";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import PlayerSession from '../models/PlayerSession.js';
import Candidate from '../models/Candidate.js';

// Serve admin dashboard
export const getAdminDashboard = asyncHandler(async (req, res) => {
    const dashboardPath = path.join(__dirname, '../../public/admin.html');
    res.sendFile(dashboardPath);
});

// Admin endpoints for viewing player choices
export const getAllPlayerChoices = asyncHandler(async (req, res) => {
    const { limit, offset, playerId } = parseQueryParams(req);
    
    try {
        // Build match stage for sessions
        const matchStage = playerId ? { player_id: playerId } : {};
        
        // Get sessions with populated choices and candidate details
        const sessions = await PlayerSession.aggregate([
            { $match: matchStage },
            { $unwind: '$choices' },
            {
                $lookup: {
                    from: 'candidates',
                    localField: 'choices.chosen_candidate_id',
                    foreignField: 'candidate_id',
                    as: 'chosen_details'
                }
            },
            {
                $lookup: {
                    from: 'candidates', 
                    localField: 'choices.rejected_candidate_id',
                    foreignField: 'candidate_id', 
                    as: 'rejected_details'
                }
            },
            {
                $unwind: '$chosen_details'
            },
            {
                $unwind: '$rejected_details'
            },
            {
                $project: {
                    _id: '$choices._id',
                    session_id: '$session_id',
                    player_id: '$player_id',
                    chosen_candidate_id: '$choices.chosen_candidate_id',
                    rejected_candidate_id: '$choices.rejected_candidate_id',
                    position: '$choices.position',
                    time_taken: '$choices.time_taken',
                    tabs_viewed: '$choices.tabs_viewed',
                    round_number: '$choices.round_number',
                    timestamp: '$choices.timestamp',
                    chosen_details: 1,
                    rejected_details: 1,
                    session_status: '$status',
                    session_start_time: '$start_time'
                }
            }
        ])
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset);

        res.json(sessions);
    } catch (error) {
        console.error("Error fetching player choices:", error);
        res.status(500).json({
            error: "Failed to fetch player choices",
            message: error.message
        });
    }
});

// Get unique players list with session analysis
export const getPlayersList = asyncHandler(async (req, res) => {
    try {
        const sessions = await PlayerSession.aggregate([
            {
                $group: {
                    _id: '$player_id',
                    sessions: { $push: '$$ROOT' },
                    totalSessions: { $sum: 1 },
                    firstSession: { $min: '$start_time' },
                    lastSession: { $max: '$start_time' },
                    completedGames: { 
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    totalRoundsPlayed: { $sum: '$total_rounds_completed' },
                    totalPlayTime: { $sum: '$total_time_taken' }
                }
            },
            {
                $project: {
                    player_id: '$_id',
                    totalSessions: 1,
                    completedGames: 1,
                    firstSession: 1,
                    lastSession: 1,
                    totalRoundsPlayed: 1,
                    avgRoundsPerGame: { 
                        $round: [{ $divide: ['$totalRoundsPlayed', '$totalSessions'] }, 1] 
                    },
                    totalPlayTime: { $round: ['$totalPlayTime', 2] },
                    avgTimePerGame: { 
                        $round: [{ $divide: ['$totalPlayTime', '$totalSessions'] }, 1] 
                    },
                    completionRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$completedGames', '$totalSessions'] }, 100] }, 1
                        ]
                    },
                    _id: 0
                }
            },
            {
                $sort: { lastSession: -1 }
            }
        ]);

        res.json(sessions);
    } catch (error) {
        console.error("Error fetching players list:", error);
        res.status(500).json({
            error: "Failed to fetch players list",
            message: error.message
        });
    }
});

// Get choices for specific player
export const getPlayerChoices = asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const { limit, offset } = parseQueryParams(req);
    
    try {
        const choices = await PlayerChoices.find({ player_id: playerId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(offset);

        res.json(choices);
    } catch (error) {
        console.error(`Error fetching choices for player ${playerId}:`, error);
        res.status(500).json({
            error: "Failed to fetch player choices",
            message: error.message
        });
    }
});

// Get choices involving specific candidate
export const getCandidateChoices = asyncHandler(async (req, res) => {
    const { candidateId } = req.params;
    const { limit, offset } = parseQueryParams(req);
    
    try {
        const choices = await PlayerChoices.find({
            $or: [
                { chosen_candidate_id: candidateId },
                { rejected_candidate_id: candidateId }
            ]
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset);

        res.json(choices);
    } catch (error) {
        console.error(`Error fetching choices for candidate ${candidateId}:`, error);
        res.status(500).json({
            error: "Failed to fetch candidate choices",
            message: error.message
        });
    }
});

// Get session summary for admin dashboard
export const getSessionSummary = asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    
    try {
        const summary = await PlayerChoices.aggregate([
            {
                $match: { player_id: playerId }
            },
            {
                $group: {
                    _id: null,
                    totalChoices: { $sum: 1 },
                    timeStats: {
                        averageTime: { $avg: '$time_taken' },
                        totalTime: { $sum: '$time_taken' },
                        minTime: { $min: '$time_taken' },
                        maxTime: { $max: '$time_taken' }
                    },
                    uniqueCandidates: { $addToSet: '$chosen_candidate_id' },
                    uniquePositions: { $addToSet: '$position' },
                    tabUsage: {
                        $push: { $each: { tab: '$tabs_viewed' } }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(summary);
    } catch (error) {
        console.error(`Error fetching session summary for player ${playerId}:`, error);
        res.status(500).json({
            error: "Failed to fetch session summary",
            message: error.message
        });
    }
});

// Get bias analytics for admin
export const getBiasAnalytics = asyncHandler(async (req, res) => {
    try {
        // Get all choices from sessions with candidate details
        const sessions = await PlayerSession.find({ choices: { $exists: true, $ne: [] } });
        
        // Flatten all choices from all sessions
        const allChoices = sessions.flatMap(session => session.choices);
        
        // Get candidate details for all choices
        const candidateIds = [...new Set(allChoices.flatMap(choice => [
            choice.chosen_candidate_id, 
            choice.rejected_candidate_id
        ]))];
        
        const candidates = await Candidate.find({ 
            candidate_id: { $in: candidateIds } 
        });
        
        const candidateMap = candidates.reduce((map, candidate) => {
            map[candidate.candidate_id] = candidate;
            return map;
        }, {});
        
        // Calculate bias analytics
        const genderAppearances = {};
        const genderChosen = {};
        const raceAppearances = {};
        const raceChosen = {};
        const ageRangeAppearances = {};
        const ageRangeChosen = {};

        // Helper function to categorize age into ranges
        const getAgeRange = (age) => {
            if (age <= 25) return "18-25";
            if (age <= 35) return "26-35";
            if (age <= 45) return "36-45";
            if (age <= 55) return "46-55";
            return "56+";
        };

        allChoices.forEach(choice => {
            const chosenCandidate = candidateMap[choice.chosen_candidate_id];
            const rejectedCandidate = candidateMap[choice.rejected_candidate_id];
            
            if (!chosenCandidate || !rejectedCandidate) return;
            
            const chosenGender = chosenCandidate.gender;
            const chosenRace = chosenCandidate.race;
            const chosenAgeRange = getAgeRange(chosenCandidate.age);
            const rejectedGender = rejectedCandidate.gender;
            const rejectedRace = rejectedCandidate.race;
            const rejectedAgeRange = getAgeRange(rejectedCandidate.age);

            // Count total appearances
            genderAppearances[chosenGender] = (genderAppearances[chosenGender] || 0) + 1;
            raceAppearances[chosenRace] = (raceAppearances[chosenRace] || 0) + 1;
            ageRangeAppearances[chosenAgeRange] = (ageRangeAppearances[chosenAgeRange] || 0) + 1;
            genderAppearances[rejectedGender] = (genderAppearances[rejectedGender] || 0) + 1;
            raceAppearances[rejectedRace] = (raceAppearances[rejectedRace] || 0) + 1;
            ageRangeAppearances[rejectedAgeRange] = (ageRangeAppearances[rejectedAgeRange] || 0) + 1;

            // Count times chosen
            genderChosen[chosenGender] = (genderChosen[chosenGender] || 0) + 1;
            raceChosen[chosenRace] = (raceChosen[chosenRace] || 0) + 1;
            ageRangeChosen[chosenAgeRange] = (ageRangeChosen[chosenAgeRange] || 0) + 1;
        });

        // Calculate hiring rates: (times chosen / total appearances) × 100
        const genderRates = {};
        const raceRates = {};
        const ageRangeRates = {};

        Object.keys(genderAppearances).forEach(gender => {
            const chosen = genderChosen[gender] || 0;
            const appearances = genderAppearances[gender];
            genderRates[gender] = ((chosen / appearances) * 100).toFixed(2);
        });

        Object.keys(raceAppearances).forEach(race => {
            const chosen = raceChosen[race] || 0;
            const appearances = raceAppearances[race];
            raceRates[race] = ((chosen / appearances) * 100).toFixed(2);
        });

        Object.keys(ageRangeAppearances).forEach(ageRange => {
            const chosen = ageRangeChosen[ageRange] || 0;
            const appearances = ageRangeAppearances[ageRange];
            ageRangeRates[ageRange] = ((chosen / appearances) * 100).toFixed(2);
        });

        // Session statistics
        const sessionStats = await PlayerSession.aggregate([
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    completedSessions: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    abandonedSessions: {
                        $sum: { $cond: [{ $eq: ["$status", "abandoned"] }, 1, 0] }
                    },
                    activeSessions: {
                        $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
                    },
                    avgRoundsPerSession: { $avg: "$total_rounds_completed" },
                    avgTimePerSession: { $avg: "$total_time_taken" },
                    uniquePlayers: { $addToSet: "$player_id" }
                }
            },
            {
                $project: {
                    totalSessions: 1,
                    completedSessions: 1,
                    abandonedSessions: 1,
                    activeSessions: 1,
                    completionRate: {
                        $round: [
                            { $multiply: [{ $divide: ["$completedSessions", "$totalSessions"] }, 100] }, 2
                        ]
                    },
                    avgRoundsPerSession: { $round: ["$avgRoundsPerSession", 1] },
                    avgTimePerSession: { $round: ["$avgTimePerSession", 1] },
                    uniquePlayers: { $size: "$uniquePlayers" }
                }
            }
        ]);

        const stats = sessionStats[0] || {
            totalSessions: 0,
            completedSessions: 0,
            abandonedSessions: 0,
            activeSessions: 0,
            completionRate: 0,
            avgRoundsPerSession: 0,
            avgTimePerSession: 0,
            uniquePlayers: 0
        };

        // Organize demographics into separate sections
        const genderDemographics = {
            appearances: genderAppearances,
            chosen: genderChosen,
            hiringRates: genderRates
        };

        const raceDemographics = {
            appearances: raceAppearances,
            chosen: raceChosen,
            hiringRates: raceRates
        };

        const ageRangeDemographics = {
            appearances: ageRangeAppearances,
            chosen: ageRangeChosen,
            hiringRates: ageRangeRates
        };

        res.json({
            demographics: {
                gender: genderDemographics,
                race: raceDemographics,
                ageRange: ageRangeDemographics
            },
            totalChoices: allChoices.length,
            totalCandidates: candidateIds.length,
            sessionStats: stats
        });
    } catch (error) {
        console.error("Error calculating bias analytics:", error);
        res.status(500).json({
            error: "Failed to calculate bias analytics",
            message: error.message
        });
    }
});

// Delete all player choices (for testing/reset)
export const clearAllPlayerChoices = asyncHandler(async (req, res) => {
    try {
        const result = await PlayerChoices.deleteMany({});
        
        res.json({
            status: "ok",
            deleted: result.deletedCount
        });
    } catch (error) {
        console.error("Error clearing player choices:", error);
        res.status(500).json({
            error: "Failed to clear player choices",
            message: error.message
        });
    }
});

// Clear all sessions and choices
export const clearAllSessionsAndChoices = asyncHandler(async (req, res) => {
    try {
        const sessionResult = await PlayerSession.deleteMany({});
        
        res.json({ 
            status: "ok", 
            deleted_sessions: sessionResult.deletedCount,
            message: "All sessions and choices cleared"
        });
    } catch (error) {
        console.error("Error clearing sessions and choices:", error);
        res.status(500).json({
            error: "Failed to clear sessions and choices",
            message: error.message
        });
    }
});