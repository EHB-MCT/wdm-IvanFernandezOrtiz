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

    getWeightedRandomItem(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = this.randomSeed ? 
            (this.seededRandom() / 10000 + 1) / 2 * totalWeight : 
            Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const item of items) {
            currentWeight += item.weight;
            if (random <= currentWeight) {
                return item.race;
            }
        }
        return items[items.length - 1].race; // fallback
    }

    getCompanyArrayForAge(age) {
        // Younger candidates (22-35): More likely to work at startups and smaller companies
        if (age <= 35) {
            return ['Startup', 'Tech Company', 'Local Business', 'Mobile App Company'];
        }
        // Mid-career (36-45): Mix of company types
        else if (age <= 45) {
            return ['Startup', 'Tech Company', 'Enterprise', 'Agency', 'Consulting Firm'];
        }
        // Experienced (46+): More likely to work at established companies
        else {
            return ['Tech Company', 'Enterprise', 'Agency', 'Consulting Firm', 'Fortune 500'];
        }
    }

    generateWorkExperiences(totalYears, age) {
        const experiences = [];
        let yearsToAllocate = totalYears;

        // Younger candidates (22-30): Usually have 1-2 jobs
        if (age <= 30) {
            const yearsAtFirstJob = Math.min(yearsToAllocate, this.random.integer(1, 4));
            experiences.push({
                years: yearsAtFirstJob,
                company: this.getRandomCompany(),
                title: 'Junior Developer' || 'Associate' || 'Coordinator'
            });
            yearsToAllocate -= yearsAtFirstJob;
        }

        // Mid-career (31-45): Usually 2-3 jobs with progression
        else if (age <= 45) {
            const numJobs = this.random.integer(2, 3);
            const yearsPerJob = Math.floor(yearsToAllocate / numJobs);
            
            for (let i = 0; i < numJobs && yearsToAllocate > 0; i++) {
                const yearsAtJob = Math.min(yearsPerJob, this.random.integer(2, 6));
                const companies = ['Startup', 'Tech Company', 'Enterprise', 'Agency', 'Consulting Firm'];
                const titles = age <= 35 ? 
                    ['Junior Developer', 'Developer', 'Senior Developer', 'Team Lead'] :
                    ['Senior Developer', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP'];
                
                experiences.push({
                    years: yearsAtJob,
                    company: this.getRandomCompany(this.getCompanyArrayForAge(age)),
                    title: this.random.pickOne(titles)
                });
                yearsToAllocate -= yearsAtJob;
            }
        }

        // Experienced (46+): Multiple jobs with clear career progression
        else {
            const numJobs = this.random.integer(3, 5);
            const yearsPerJob = Math.floor(yearsToAllocate / numJobs);
            
            for (let i = 0; i < numJobs && yearsToAllocate > 0; i++) {
                const yearsAtJob = Math.min(yearsPerJob, this.random.integer(2, 8));
                const companies = this.getCompanyArrayForAge(age);
                const titles = ['Developer', 'Senior Developer', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP'];
                
                experiences.push({
                    years: yearsAtJob,
                    company: this.getRandomCompany(companies),
                    title: this.random.pickOne(titles)
                });
                yearsToAllocate -= yearsAtJob;
            }
        }

        // Ensure we don't exceed total years
        const totalAllocated = experiences.reduce((sum, exp) => sum + exp.years, 0);
        if (totalAllocated < totalYears) {
            experiences[0].years += (totalYears - totalAllocated);
        }

        return experiences;
    }

    formatWorkExperience(experiences) {
        if (experiences.length === 1) {
            const exp = experiences[0];
            return `${exp.years} years at ${exp.company} as ${exp.title}`;
        }

        // Format multiple experiences
        const mainExp = experiences[0];
        if (experiences.length === 2) {
            const secondExp = experiences[1];
            return `${mainExp.years} years at ${mainExp.company} as ${mainExp.title}, ${secondExp.years} years at ${secondExp.company} as ${secondExp.title}`;
        }

        const recentExp = experiences.slice(1);
        const additionalExp = recentExp.map(exp => 
            `${exp.years} years at ${exp.company} as ${exp.title}`
        ).join(', ');
        
        return `${mainExp.years} years at ${mainExp.company} as ${mainExp.title}, ${additionalExp}`;
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
        
        // Pick gender first, then select corresponding name
        const gender = this.random.pickOne(this.namesConfig.genders);
        let firstName;
        
        if (gender === "Male") {
            firstName = this.random.pickOne(this.namesConfig.maleFirstNames);
        } else if (gender === "Female") {
            firstName = this.random.pickOne(this.namesConfig.femaleFirstNames);
        } else {
            // For "Other" gender, mix both name arrays
            const allNames = [...this.namesConfig.maleFirstNames, ...this.namesConfig.femaleFirstNames];
            firstName = this.random.pickOne(allNames);
        }
        
        const lastName = this.random.pickOne(this.namesConfig.lastNames);
        const fullName = `${firstName} ${lastName}`;

        // Generate skills
        const skillCount = this.random.integer(
            this.positionsConfig.generation.minSkillsPerCandidate,
            this.positionsConfig.generation.maxSkillsPerCandidate
        );
        const selectedSkills = this.getRandomItems(template.skills, skillCount);

        // Generate age first (22-65, reasonable working age range)
        const age = this.random.integer(22, 65);

        // Generate realistic work experience based on age
        const maxPossibleExperience = Math.max(0, age - 18); // Started working at 18 earliest
        
        // Adjust expected experience based on age - older candidates should have more experience
        let minExpectedExp, maxExpectedExp;
        if (age <= 25) {
            minExpectedExp = 0; maxExpectedExp = Math.min(3, maxPossibleExperience);
        } else if (age <= 30) {
            minExpectedExp = 2; maxExpectedExp = Math.min(6, maxPossibleExperience);
        } else if (age <= 40) {
            minExpectedExp = 5; maxExpectedExp = Math.min(15, maxPossibleExperience);
        } else if (age <= 50) {
            minExpectedExp = 10; maxExpectedExp = Math.min(25, maxPossibleExperience);
        } else {
            minExpectedExp = 15; maxExpectedExp = Math.min(maxPossibleExperience, 40);
        }
        
        const experienceYears = this.random.integer(
            Math.max(template.experienceRange[0], minExpectedExp),
            Math.min(template.experienceRange[1], maxExpectedExp)
        );
        
        // Generate multiple work experiences for older candidates
        const workExperiences = this.generateWorkExperiences(experienceYears, age);
        const company = this.getRandomCompany(template.companyCategory);
        const experience = this.formatWorkExperience(workExperiences);

        // Get education
        const education = this.getRandomEducation(template.educationCategory);

        // Generate race with more realistic distribution
        const races = ["White", "Black", "Hispanic", "Asian", "Native American", "Pacific Islander", "Middle Eastern", "Mixed", "Other"];
        const raceDistribution = [
            { race: "White", weight: 60 },
            { race: "Black", weight: 13 },
            { race: "Hispanic", weight: 18 },
            { race: "Asian", weight: 6 },
            { race: "Native American", weight: 0.7 },
            { race: "Pacific Islander", weight: 0.2 },
            { race: "Middle Eastern", weight: 0.6 },
            { race: "Mixed", weight: 1.2 },
            { race: "Other", weight: 0.3 }
        ];
        
        const race = this.getWeightedRandomItem(raceDistribution);

        return {
            candidate_id: `CAND${String(id).padStart(3, '0')}`,
            candidateName: fullName,
            position: position,
            gender: gender,
            age: age,
            race: race,
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

    getRandomCompany(category = null) {
        
        if (this.companiesConfig && this.companiesConfig.companies[category]) {
            const company = this.random.pickOne(this.companiesConfig.companies[category]);
            console.log(`Selected company from category ${category}:`, company);
            return company;
        }
        
        // If no category specified, pick from all available companies
        const allCompanies = [];
        for (const cat in this.companiesConfig.companies) {
            allCompanies.push(...this.companiesConfig.companies[cat]);
        }
        const randomCompany = allCompanies.length > 0 ? this.random.pickOne(allCompanies) : 'Unknown Company';
        console.log(`Selected random company from all:`, randomCompany);
        return randomCompany;
    }

    getRandomEducation(category) {
        if (this.educationConfig.education[category]) {
            return this.random.pickOne(this.educationConfig.education[category]);
        }
        return 'Unknown University';
    }
}

export default CandidateTemplateEngine;