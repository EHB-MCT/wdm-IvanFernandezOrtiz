import dotenv from "dotenv";
import { connectDatabase } from "./src/config/database.js";
import Candidate from "./src/models/Candidate.js";
import fs from "fs";

// Load environment variables
dotenv.config();

const importCandidates = async () => {
    try {
        await connectDatabase();
        
        // Read candidates from JSON file
        const candidatesData = JSON.parse(fs.readFileSync("./recruiting-game/data/candidates.json", "utf8"));
        
        // Clear existing candidates
        await Candidate.deleteMany({});
        console.log("Cleared existing candidates");
        
        // Insert new candidates
        const candidates = await Candidate.insertMany(candidatesData);
        console.log(`Imported ${candidates.length} candidates`);
        
        // Display imported candidates
        candidates.forEach(candidate => {
            console.log(`- ${candidate.candidate_id}: ${candidate.candidateName} (${candidate.position})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("Error importing candidates:", error);
        process.exit(1);
    }
};

importCandidates();