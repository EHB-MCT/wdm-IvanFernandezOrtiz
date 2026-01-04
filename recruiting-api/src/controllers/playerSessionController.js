import { asyncHandler } from "../middleware/errorHandler.js";
import { parseQueryParams } from "../utils/responseHelpers.js";
import PlayerSession from "../models/PlayerSession.js";

// Create a new player session
export const createPlayerSession = asyncHandler(async (req, res) => {
    const { player_id, max_rounds = 10 } = req.body;
    
    // Generate unique session ID
    const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await PlayerSession.create({
        session_id,
        player_id,
        choices: [],
        max_rounds,
        status: "active",
        start_time: new Date()
    });
    
    res.status(201).json({ 
        status: "ok", 
        session_id: session.session_id,
        message: "Player session created successfully"
    });
});

// Add a choice to existing session
export const addChoiceToSession = asyncHandler(async (req, res) => {
    const { session_id } = req.params;
    const { 
        round_number, 
        chosen_candidate_id, 
        rejected_candidate_id, 
        position, 
        time_taken, 
        tabs_viewed 
    } = req.body;
    
    // Validate round number
    if (round_number < 1 || round_number > 10) {
        return res.status(400).json({
            error: "Invalid round number",
            message: "Round number must be between 1 and 10"
        });
    }
    
    const session = await PlayerSession.findOne({ session_id });
    
    if (!session) {
        return res.status(404).json({
            error: "Session not found",
            message: `No session found with ID: ${session_id}`
        });
    }
    
    if (session.status !== "active") {
        return res.status(400).json({
            error: "Session not active",
            message: "Cannot add choices to completed or abandoned sessions"
        });
    }
    
    // Check if round already exists
    const existingChoice = session.choices.find(c => c.round_number === round_number);
    if (existingChoice) {
        return res.status(400).json({
            error: "Round already completed",
            message: `Round ${round_number} has already been completed for this session`
        });
    }
    
    // Add choice to session
    session.choices.push({
        round_number,
        chosen_candidate_id,
        rejected_candidate_id,
        position,
        time_taken,
        tabs_viewed,
        timestamp: new Date()
    });
    
    // Update session if max rounds reached
    if (session.choices.length >= session.max_rounds) {
        session.status = "completed";
        session.end_time = new Date();
    }
    
    await session.save();
    
    res.json({ 
        status: "ok", 
        round_completed: round_number,
        total_rounds: session.choices.length,
        session_status: session.status
    });
});

// Get all player sessions (for admin)
export const getAllPlayerSessions = asyncHandler(async (req, res) => {
    const { limit, offset } = parseQueryParams(req);
    
    const sessions = await PlayerSession.find()
        .sort({ start_time: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    
    res.json(sessions);
});

// Get specific player session details
export const getPlayerSession = asyncHandler(async (req, res) => {
    const { session_id } = req.params;
    
    const session = await PlayerSession.findOne({ session_id })
        .populate({
            path: 'choices.chosen_candidate_id',
            model: 'Candidate',
            select: 'candidate_id candidateName gender age race position education workExperience skills'
        })
        .populate({
            path: 'choices.rejected_candidate_id', 
            model: 'Candidate',
            select: 'candidate_id candidateName gender age race position education workExperience skills'
        });
    
    if (!session) {
        return res.status(404).json({
            error: "Session not found",
            message: `No session found with ID: ${session_id}`
        });
    }
    
    res.json(session);
});

// End a player session
export const endPlayerSession = asyncHandler(async (req, res) => {
    const { session_id } = req.params;
    
    const session = await PlayerSession.findOne({ session_id });
    
    if (!session) {
        return res.status(404).json({
            error: "Session not found", 
            message: `No session found with ID: ${session_id}`
        });
    }
    
    session.status = session.choices.length >= session.max_rounds ? "completed" : "abandoned";
    session.end_time = new Date();
    
    await session.save();
    
    res.json({ 
        status: "ok", 
        session_status: session.status,
        rounds_completed: session.choices.length,
        total_time: session.total_time_taken
    });
});

// Get player session analytics
export const getSessionAnalytics = asyncHandler(async (req, res) => {
    const analytics = await PlayerSession.aggregate([
        {
            $group: {
                _id: null,
                total_sessions: { $sum: 1 },
                completed_sessions: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                },
                abandoned_sessions: {
                    $sum: { $cond: [{ $eq: ["$status", "abandoned"] }, 1, 0] }
                },
                active_sessions: {
                    $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
                },
                avg_rounds_completed: { $avg: "$total_rounds_completed" },
                avg_time_per_session: { $avg: "$total_time_taken" },
                total_players: { $addToSet: "$player_id" }
            }
        },
        {
            $project: {
                total_sessions: 1,
                completed_sessions: 1,
                abandoned_sessions: 1,
                active_sessions: 1,
                completion_rate: {
                    $round: [
                        { $multiply: [{ $divide: ["$completed_sessions", "$total_sessions"] }, 100] }, 2
                    ]
                },
                avg_rounds_completed: { $round: ["$avg_rounds_completed", 1] },
                avg_time_per_session: { $round: ["$avg_time_per_session", 1] },
                unique_players: { $size: "$total_players" }
            }
        }
    ]);
    
    res.json(analytics[0] || {
        total_sessions: 0,
        completed_sessions: 0,
        abandoned_sessions: 0,
        active_sessions: 0,
        completion_rate: 0,
        avg_rounds_completed: 0,
        avg_time_per_session: 0,
        unique_players: 0
    });
});

export const clearAllSessions = asyncHandler(async (req, res) => {
    const result = await PlayerSession.deleteMany({});
    
    res.json({ 
        status: "ok", 
        deleted: result.deletedCount,
        message: "All sessions cleared"
    });
});