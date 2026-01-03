import { asyncHandler } from "../middleware/errorHandler.js";

import PlayerSession from "../models/PlayerSession.js";
import Candidate from "../models/Candidate.js";

// Migrate existing individual choices to session-based structure
export const migrateChoicesToSessions = asyncHandler(async (req, res) => {
    try {
        console.log("Starting migration...");
        
        // Get all existing choices grouped by player
        const playerChoices = await PlayerChoices.aggregate([
            {
                $sort: { player_id: 1, timestamp: 1 }
            },
            {
                $group: {
                    _id: "$player_id",
                    choices: { $push: "$$ROOT" }
                }
            }
        ]);

        console.log(`Found ${playerChoices.length} players to migrate`);

        const sessions = [];
        
        for (const player of playerChoices) {
            const player_id = player._id;
            const choices = player.choices;
            
            // Group choices by session (assuming sequential timestamps = different sessions)
            const sessionGroups = [];
            let currentSession = [];
            let lastTimestamp = null;
            
            for (const choice of choices) {
                // If gap > 30 minutes or first choice, start new session
                if (!lastTimestamp || 
                    new Date(choice.timestamp) - new Date(lastTimestamp) > 30 * 60 * 1000) {
                    
                    if (currentSession.length > 0) {
                        sessionGroups.push([...currentSession]);
                    }
                    currentSession = [];
                }
                
                currentSession.push(choice);
                lastTimestamp = choice.timestamp;
            }
            
            if (currentSession.length > 0) {
                sessionGroups.push(currentSession);
            }
            
            // Create session documents
            for (let i = 0; i < sessionGroups.length; i++) {
                const sessionChoices = sessionGroups[i];
                const session_id = `migrated_${player_id}_${i + 1}_${Date.now()}`;
                
                const sessionData = {
                    session_id,
                    player_id,
                    choices: sessionChoices.map(choice => ({
                        round_number: choice.round_number,
                        chosen_candidate_id: choice.chosen_candidate_id,
                        rejected_candidate_id: choice.rejected_candidate_id,
                        position: choice.position,
                        time_taken: choice.time_taken,
                        tabs_viewed: choice.tabs_viewed,
                        timestamp: choice.timestamp
                    })),
                    start_time: sessionChoices[0]?.timestamp || new Date(),
                    end_time: sessionChoices[sessionChoices.length - 1]?.timestamp || new Date(),
                    status: sessionChoices.length >= 10 ? "completed" : "abandoned",
                    max_rounds: 10
                };
                
                sessions.push(sessionData);
            }
        }

        if (sessions.length > 0) {
            // Insert all sessions
            await PlayerSession.insertMany(sessions);
            console.log(`Created ${sessions.length} sessions from existing choices`);
            
            res.json({
                status: "ok",
                migrated_players: playerChoices.length,
                created_sessions: sessions.length,
                message: "Migration completed successfully"
            });
        } else {
            res.json({
                status: "ok",
                message: "No choices to migrate"
            });
        }
        
    } catch (error) {
        console.error("Migration error:", error);
        res.status(500).json({
            error: "Migration failed",
            message: error.message
        });
    }
});