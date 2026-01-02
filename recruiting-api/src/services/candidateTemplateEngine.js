import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CandidateTemplateEngine {
    constructor() {
        this.isInitialized = false;
        this.namesConfig = null;
        this.educationConfig = null;
        this.companiesConfig = null;
        this.positionsConfig = null;
        this.randomSeed = null;
        this.random = {
            integer: (min, max) => {
                const random = this.randomSeed ? this.seededRandom() : Math.random();
                return Math.floor(random * (max - min + 1)) + min;
            },
            pickOne: (array) => {
                const random = this.randomSeed ? this.seededRandom() : Math.random();
                return array[Math.floor(random * array.length)];
            }
        };
    }

    setSeed(seed) {
        this.randomSeed = seed;
    }

    seededRandom() {
        const x = Math.sin(this.randomSeed++) * 10000;
        return x - Math.floor(x);
    }

    async initialize() {
        if (this.isInitialized) return true;

        try {
            const configDir = path.join(__dirname, '../config/data');
            await this.loadConfigs(configDir);
            this.isInitialized = true;
            console.log('Candidate template engine initialized successfully');
            return true;
        } catch (error) {
            console.error(`Failed to initialize candidate template engine: ${error.message}`);
            throw error;
        }
    }

    async loadConfigs(configDir) {
        this.namesConfig = await this.loadJson(path.join(configDir, 'names.json'));
        this.educationConfig = await this.loadJson(path.join(configDir, 'education.json'));
        this.companiesConfig = await this.loadJson(path.join(configDir, 'companies.json'));
        this.positionsConfig = await this.loadJson(path.join(configDir, 'positions.json'));
    }

    async loadJson(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Failed to load or parse JSON from ${filePath}: ${error.message}`);
        }
    }

    generateCandidate(position, id) {
        if (!this.isInitialized) {
            throw new Error('CandidateTemplateEngine not initialized. Call initialize() first.');
        }

        if (!this.positionsConfig.positions[position]) {
            throw new Error(`Position '${position}' not found in configuration`);
        }

        const template = this.positionsConfig.positions[position];
        const firstName = this.random.pickOne(this.namesConfig.firstNames);
        const lastName = this.random.pickOne(this.namesConfig.lastNames);
        const fullName = `${firstName} ${lastName}`;

        // Generate skills
        const skillCount = this.random.integer(
            this.positionsConfig.generation.minSkillsPerCandidate,
            this.positionsConfig.generation.maxSkillsPerCandidate
        );
        const selectedSkills = this.getRandomItems(template.skills, skillCount);

        // Generate experience
        const experienceYears = this.random.integer(template.experienceRange[0], template.experienceRange[1]);
        const company = this.getRandomCompany(template.companyCategory);
        const experience = `${experienceYears} years at ${company}`;

        // Get education
        const education = this.getRandomEducation(template.educationCategory);

        return {
            candidate_id: `CAND${String(id).padStart(3, '0')}`,
            candidateName: fullName,
            position: position,
            gender: this.random.pickOne(this.namesConfig.genders),
            education: education,
            skills: selectedSkills,
            workExperience: experience,
            picturePath: this.random.pickOne(this.namesConfig.avatarPaths)
        };
    }

    async generateAllCandidates() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const allCandidates = [];
        let candidateIdCounter = 1;

        const positions = Object.keys(this.positionsConfig.positions);

        for (const position of positions) {
            console.log(`Generating ${this.positionsConfig.generation.candidatesPerPosition} candidates for position: ${position}`);

            for (let i = 0; i < this.positionsConfig.generation.candidatesPerPosition; i++) {
                const candidate = this.generateCandidate(position, candidateIdCounter);
                allCandidates.push(candidate);
                candidateIdCounter++;
            }
        }

        return allCandidates;
    }

    getAvailablePositions() {
        return this.positionsConfig ? Object.keys(this.positionsConfig.positions) : [];
    }

    getRandomItems(array, count) {
        const result = [];
        if (!array || array.length === 0 || count <= 0) return result;

        const available = [...array];
        const actualCount = Math.min(count, available.length);

        for (let i = 0; i < actualCount && available.length > 0; i++) {
            const index = Math.floor(this.random.integer(0, available.length - 1));
            result.push(available[index]);
            available.splice(index, 1);
        }

        return result;
    }

    getRandomCompany(category) {
        if (this.companiesConfig.companies[category]) {
            return this.random.pickOne(this.companiesConfig.companies[category]);
        }
        return 'Unknown Company';
    }

    getRandomEducation(category) {
        if (this.educationConfig.education[category]) {
            return this.random.pickOne(this.educationConfig.education[category]);
        }
        return 'Unknown University';
    }
}

export default CandidateTemplateEngine;