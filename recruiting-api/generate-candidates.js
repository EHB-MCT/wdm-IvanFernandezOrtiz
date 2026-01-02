import dotenv from "dotenv";
import { connectDatabase } from "./src/config/app/database.js";
import CandidateGenerator from "./src/services/candidateGeneratorService.js";
import Candidate from "./src/models/Candidate.js";

// Load environment variables
dotenv.config();

const generateCandidates = async () => {
    try {
        await connectDatabase();
        
        // Clear existing candidates
        await Candidate.deleteMany({});
        console.log("Cleared existing candidates");
        
        // Generate new candidates
        const candidates = await CandidateGenerator.generateCandidates();
        
        // Insert in batches
        const batchSize = 50;
        for (let i = 0; i < candidates.length; i += batchSize) {
            const batch = candidates.slice(i, i + batchSize);
            await Candidate.insertMany(batch);
            console.log(`Saved batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(candidates.length/batchSize)} (${batch.length} candidates)`);
        }
        
        console.log(`Successfully generated and saved ${candidates.length} candidates across 10 positions`);
        process.exit(0);
    } catch (error) {
        console.error("Error generating candidates:", error);
        process.exit(1);
    }
};

generateCandidates();