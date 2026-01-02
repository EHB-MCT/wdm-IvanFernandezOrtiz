import CandidateTemplateEngine from "./src/services/candidateTemplateEngine.js";
import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api/candidates/batch";

const generateAndPostCandidates = async () => {
    try {
        console.log("Starting candidate generation...");
        
        // Initialize template engine
        const templateEngine = new CandidateTemplateEngine();
        await templateEngine.initialize();
        
        // Generate candidates
        const candidates = await templateEngine.generateAllCandidates();
        console.log(`Generated ${candidates.length} candidates`);
        
        // Post to API in batches of 50
        const batchSize = 50;
        for (let i = 0; i < candidates.length; i += batchSize) {
            const batch = candidates.slice(i, i + batchSize);
            const requestData = { candidates: batch };
            
            console.log(`Posting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(candidates.length/batchSize)} (${batch.length} candidates)`);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API request failed: ${error}`);
            }
            
            const result = await response.json();
            console.log(`Batch created successfully: ${result.created} candidates`);
        }
        
        console.log(`Successfully created ${candidates.length} candidates in the database`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

generateAndPostCandidates();