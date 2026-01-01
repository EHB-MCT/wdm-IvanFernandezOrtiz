import mongoose from "mongoose";

// Simple random implementation
const random = {
    integer: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    pickOne: (array) => array[Math.floor(Math.random() * array.length)]
};

// First names and last names for generating realistic candidate names
const firstNames = [
    "John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", 
    "James", "Mary", "William", "Jennifer", "Richard", "Linda", "Joseph", "Patricia",
    "Thomas", "Jessica", "Charles", "Ashley", "Christopher", "Amanda", "Daniel", "Melissa",
    "Matthew", "Deborah", "Anthony", "Stephanie", "Mark", "Rebecca", "Steven", "Laura",
    "Paul", "Sharon", "Andrew", "Cynthia", "Joshua", "Kathy", "Kevin", "Amy",
    "Brian", "Angela", "George", "Brenda", "Edward", "Pamela", "Ronald", "Nicole",
    "Timothy", "Katherine", "Jason", "Samantha", "Jeffrey", "Christine", "Ryan", "Rachel",
    "Jacob", "Megan", "Gary", "Tiffany", "Nicholas", "Virginia", "Eric", "Benjamin"
];

const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia",
    "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson",
    "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson",
    "Walker", "Hall", "Allen", "Young", "King", "Scott", "Green", "Adams",
    "Baker", "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Phillips", "Campbell",
    "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Morris",
    "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera",
    "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torrance", "Peterson", "Gray"
];

// Skills, education, and experience templates for each position
const templates = {
    "Software Developer": {
        skills: [
            "JavaScript", "Python", "React", "Node.js", "TypeScript", "Java", "C#", "Angular",
            "Vue.js", "Django", "Flask", "Spring Boot", "MongoDB", "PostgreSQL", "MySQL",
            "Docker", "Kubernetes", "AWS", "Azure", "Git", "CI/CD", "REST APIs", "GraphQL"
        ],
        educationOptions: [
            "MIT Computer Science", "Stanford University", "Carnegie Mellon University",
            "UC Berkeley", "Georgia Tech", "University of Washington", "University of Texas",
            "Purdue University", "Virginia Tech", "University of Illinois"
        ],
        experiencePrefixes: [
            "Tech Innovations Inc.", "Digital Solutions Ltd.", "CloudTech Systems",
            "Enterprise Software Co.", "Startup Ventures LLC", "Innovation Labs",
            "Software Architects Inc.", "DevOps Masters", "Web Development Studio",
            "Mobile App Company"
        ]
    },
    "Graphic Designer": {
        skills: [
            "Illustrator", "Photoshop", "Figma", "Sketch", "Adobe XD", "InDesign", "CorelDRAW",
            "Canva", "GIMP", "Figma", "Prototyping", "UI Design", "UX Design", "Brand Design",
            "Typography", "Color Theory", "Layout Design", "Web Design", "Print Design"
        ],
        educationOptions: [
            "Rhode Island School of Design", "Parsons School of Design", "Pratt Institute",
            "California Institute of the Arts", "School of Visual Arts", "ArtCenter College of Design",
            "Savannah College of Art and Design", "Ringling College of Art and Design",
            "Academy of Art University", "Maryland Institute College of Art"
        ],
        experiencePrefixes: [
            "Creative Digital Agency", "Design Studio Pro", "Brand Innovation Lab",
            "Visual Communications Co.", "UX/UI Design Firm", "Marketing Creative Agency",
            "Digital Art Studio", "Graphic Design Masters", "Visual Branding Company",
            "Creative Solutions Inc."
        ]
    },
    "Data Analyst": {
        skills: [
            "SQL", "Python", "R", "Tableau", "Power BI", "Excel", "Data Visualization",
            "Statistical Analysis", "Machine Learning", "Pandas", "NumPy", "Jupyter",
            "Google Analytics", "SAS", "SPSS", "Data Mining", "Business Intelligence",
            "Data Warehousing", "ETL", "Dashboard Creation"
        ],
        educationOptions: [
            "Stanford University", "MIT", "UC Berkeley", "Harvard University", "Yale University",
            "Princeton University", "Columbia University", "University of Chicago",
            "University of Pennsylvania", "Northwestern University"
        ],
        experiencePrefixes: [
            "DataDriven Solutions", "Analytics Pro Inc.", "Business Intelligence Co.",
            "Data Science Studio", "Market Research Analytics", "Financial Data Firm",
            "Healthcare Analytics", "Retail Analytics Pro", "Sports Analytics Inc.",
            "Social Media Data Co."
        ]
    },
    "Project Manager": {
        skills: [
            "Agile", "Scrum", "Leadership", "Communication", "Risk Management", "Budget Planning",
            "Team Management", "Stakeholder Management", "Microsoft Project", "JIRA",
            "Trello", "Asana", "PMP", "PRINCE2", "Change Management", "Quality Assurance",
            "Resource Allocation", "Timeline Management", "Documentation"
        ],
        educationOptions: [
            "Harvard Business School", "Stanford Graduate School", "Wharton School",
            "MIT Sloan", "Kellogg School of Management", "Chicago Booth", "Columbia Business",
            "Haas School of Business", "Stern School of Business", "Fuqua School of Business"
        ],
        experiencePrefixes: [
            "Global Consulting Group", "Project Management Inc.", "Enterprise Solutions Co.",
            "Strategic Planning Firm", "Business Transformation Co.", "Change Management Pro",
            "IT Project Leaders", "Construction Management", "Product Development Co.",
            "Operations Excellence Inc."
        ]
    },
    "UX Designer": {
        skills: [
            "Figma", "Sketch", "Adobe XD", "User Research", "Wireframing", "Prototyping",
            "Usability Testing", "Information Architecture", "Interaction Design", "Visual Design",
            "Design Systems", "Journey Mapping", "Persona Development", "A/B Testing",
            "Responsive Design", "Accessibility", "Mobile Design", "HTML", "CSS", "JavaScript"
        ],
        educationOptions: [
            "Carnegie Mellon University", "Stanford University", "MIT", "Harvard University",
            "UC Berkeley", "University of Washington", "Georgia Tech", "University of Michigan",
            "New York University", "Columbia University"
        ],
        experiencePrefixes: [
            "UX Design Studio", "User Experience Pro", "Digital Product Agency",
            "Innovation Design Lab", "Mobile UX Co.", "Web UX Firm", "App Design Studio",
            "Interface Design Inc.", "Human-Centered Design Co.", "Digital Experience Lab"
        ]
    },
    "DevOps Engineer": {
        skills: [
            "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Jenkins", "GitLab CI",
            "CircleCI", "Terraform", "Ansible", "Puppet", "Chef", "Linux", "Bash Scripting",
            "Python", "Go", "Monitoring Tools", "Logging", "Security", "Networking"
        ],
        educationOptions: [
            "Carnegie Mellon University", "MIT", "Stanford University", "UC Berkeley",
            "Georgia Tech", "University of Illinois", "Purdue University", "University of Texas",
            "University of Washington", "Virginia Tech"
        ],
        experiencePrefixes: [
            "CloudTech Systems", "DevOps Masters", "Infrastructure as Code Co.",
            "Cloud Native Solutions", "Automation Pro", "Platform Engineering Inc.",
            "Site Reliability Engineering", "Cloud Architecture Firm", "DevOps Consulting",
            "Infrastructure Solutions"
        ]
    },
    "Marketing Specialist": {
        skills: [
            "SEO", "Content Marketing", "Social Media", "Email Marketing", "Google Analytics",
            "Facebook Ads", "LinkedIn Marketing", "Twitter Marketing", "Instagram Marketing",
            "Copywriting", "Brand Strategy", "Market Research", "Campaign Management",
            "Marketing Automation", "Analytics", "A/B Testing", "PPC Advertising"
        ],
        educationOptions: [
            "Northwestern University", "University of Pennsylvania", "University of Michigan",
            "UCLA", "University of Texas", "New York University", "Boston University",
            "University of Southern California", "University of North Carolina", "Indiana University"
        ],
        experiencePrefixes: [
            "Digital Marketing Pro", "Creative Agency Co.", "Brand Marketing Inc.",
            "Social Media Masters", "Content Creation Studio", "Advertising Agency",
            "Marketing Analytics Co.", "Growth Hacking Lab", "Email Marketing Pro",
            "SEO Optimization Inc."
        ]
    },
    "Backend Developer": {
        skills: [
            "Java", "Spring Boot", "Node.js", "Python", "Django", "Flask", "Ruby on Rails",
            "PHP", "Laravel", "C#", ".NET Core", "Go", "Rust", "MongoDB", "PostgreSQL",
            "MySQL", "Redis", "REST APIs", "GraphQL", "Microservices", "Docker", "Kubernetes"
        ],
        educationOptions: [
            "Carnegie Mellon University", "MIT", "Stanford University", "UC Berkeley",
            "Georgia Tech", "University of Illinois", "University of Washington", "Purdue University",
            "University of Texas", "University of Michigan"
        ],
        experiencePrefixes: [
            "Enterprise Software Co.", "Backend Systems Inc.", "API Development Studio",
            "Database Solutions Co.", "Server Architecture Firm", "Cloud Backend Pro",
            "Microservices Masters", "API Gateway Inc.", "Data Systems Co.", "Enterprise Architecture"
        ]
    },
    "Product Designer": {
        skills: [
            "UI Design", "UX Design", "Figma", "Sketch", "Adobe Creative Suite", "Prototyping",
            "User Research", "Design Thinking", "Design Systems", "Wireframing", "Visual Design",
            "Interaction Design", "Mobile Design", "Web Design", "Typography", "Color Theory",
            "Brand Design", "CSS", "HTML", "JavaScript"
        ],
        educationOptions: [
            "Rhode Island School of Design", "Pratt Institute", "California Institute of the Arts",
            "School of Visual Arts", "Parsons School of Design", "ArtCenter College of Design",
            "Savannah College of Art and Design", "Maryland Institute College of Art",
            "Academy of Art University", "Carnegie Mellon University"
        ],
        experiencePrefixes: [
            "Innovation Labs", "Product Design Studio", "Design Strategy Co.",
            "Creative Product Agency", "Design Innovation Lab", "Product UX Firm",
            "Digital Product Design", "User Centered Design Co.", "Design Thinking Studio",
            "Product Experience Inc."
        ]
    },
    "Full Stack Developer": {
        skills: [
            "JavaScript", "React", "Node.js", "Python", "Django", "TypeScript", "Angular",
            "Vue.js", "MongoDB", "PostgreSQL", "MySQL", "REST APIs", "GraphQL", "Docker",
            "Kubernetes", "AWS", "Azure", "Git", "CI/CD", "HTML", "CSS", "SASS", "Webpack"
        ],
        educationOptions: [
            "University of Washington", "Stanford University", "MIT", "UC Berkeley",
            "Carnegie Mellon University", "Georgia Tech", "University of Illinois", "Purdue University",
            "University of Texas", "University of Michigan"
        ],
        experiencePrefixes: [
            "Startup Ventures LLC", "Full Stack Solutions", "Web Development Studio",
            "Digital Innovation Co.", "Tech Startup Inc.", "Web Application Masters",
            "Complete Web Solutions", "End-to-End Development", "Web Technology Pro",
            "Full Stack Agency"
        ]
    }
};

const generateCandidates = async () => {
    try {
        console.log("Starting candidate generation...");
        
        const allCandidates = [];
        let candidateIdCounter = 1;

        const positions = Object.keys(templates);

        for (const position of positions) {
            const template = templates[position];
            console.log(`Generating 10 candidates for position: ${position}`);

            for (let i = 0; i < 10; i++) {
                const candidate = generateSingleCandidate(position, template, candidateIdCounter);
                allCandidates.push(candidate);
                candidateIdCounter++;
            }
        }

        return allCandidates;
    } catch (error) {
        console.error(`Error generating candidates: ${error.message}`);
        throw error;
    }
};

const generateSingleCandidate = (position, template, id) => {
    const firstName = firstNames[random.integer(0, firstNames.length - 1)];
    const lastName = lastNames[random.integer(0, lastNames.length - 1)];
    const fullName = `${firstName} ${lastName}`;

    // Generate 3-6 random skills
    const skillCount = random.integer(3, 6);
    const selectedSkills = [];
    const availableSkills = [...template.skills];
    
    for (let i = 0; i < skillCount && availableSkills.length > 0; i++) {
        const skillIndex = random.integer(0, availableSkills.length - 1);
        selectedSkills.push(availableSkills[skillIndex]);
        availableSkills.splice(skillIndex, 1);
    }

    // Generate experience years (1-15 years)
    const experienceYears = random.integer(1, 15);
    
    // Create experience description
    const company = template.experiencePrefixes[random.integer(0, template.experiencePrefixes.length - 1)];
    const experience = `${experienceYears} years at ${company}`;

    return {
        candidate_id: `CAND${String(id).padStart(3, '0')}`,
        candidateName: fullName,
        position: position,
        gender: random.pickOne(['Male', 'Female', 'Other']),
        education: template.educationOptions[random.integer(0, template.educationOptions.length - 1)],
        skills: selectedSkills,
        workExperience: experience,
        picturePath: random.pickOne(["res://assets/icon.svg", "res://assets/icon2.svg"])
    };
};

export default {
    generateCandidates
};