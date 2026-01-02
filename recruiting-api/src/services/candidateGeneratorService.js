import CandidateTemplateEngine from './candidateTemplateEngine.js';

const templateEngine = new CandidateTemplateEngine();

const generateCandidates = async () => {
    try {
        console.log("Starting candidate generation...");
        
        // Initialize template engine if not already done
        await templateEngine.initialize();
        
        // Generate all candidates using the template engine
        const allCandidates = await templateEngine.generateAllCandidates();
        
        return allCandidates;
    } catch (error) {
        console.error(`Error generating candidates: ${error.message}`);
        throw error;
    }
};

const generateSingleCandidate = async (position, id) => {
    try {
        await templateEngine.initialize();
        return templateEngine.generateCandidate(position, id);
    } catch (error) {
        console.error(`Error generating candidate: ${error.message}`);
        throw error;
    }
};

export default {
    generateCandidates,
    generateSingleCandidate
};