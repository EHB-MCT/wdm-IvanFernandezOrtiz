using Godot;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

public static class CandidateGenerator
{
    private static readonly Random _random = new Random();
    
    // First names and last names for generating realistic candidate names
    private static readonly string[] _firstNames = {
        "John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", 
        "James", "Mary", "William", "Jennifer", "Richard", "Linda", "Joseph", "Patricia",
        "Thomas", "Jessica", "Charles", "Ashley", "Christopher", "Amanda", "Daniel", "Melissa",
        "Matthew", "Deborah", "Anthony", "Stephanie", "Mark", "Rebecca", "Steven", "Laura",
        "Paul", "Sharon", "Andrew", "Cynthia", "Joshua", "Kathy", "Kevin", "Amy",
        "Brian", "Angela", "George", "Brenda", "Edward", "Pamela", "Ronald", "Nicole",
        "Timothy", "Katherine", "Jason", "Samantha", "Jeffrey", "Christine", "Ryan", "Rachel",
        "Jacob", "Megan", "Gary", "Tiffany", "Nicholas", "Virginia", "Eric", "Benjamin"
    };
    
    private static readonly string[] _lastNames = {
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia",
        "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson",
        "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson",
        "Walker", "Hall", "Allen", "Young", "King", "Scott", "Green", "Adams",
        "Baker", "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Phillips", "Campbell",
        "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Morris",
        "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera",
        "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torrance", "Peterson", "Gray"
    };

    // Skills, education, and experience templates for each position
    private static readonly Dictionary<string, CandidateTemplate> _templates = new()
    {
        ["Software Developer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "JavaScript", "Python", "React", "Node.js", "TypeScript", "Java", "C#", "Angular",
                "Vue.js", "Django", "Flask", "Spring Boot", "MongoDB", "PostgreSQL", "MySQL",
                "Docker", "Kubernetes", "AWS", "Azure", "Git", "CI/CD", "REST APIs", "GraphQL"
            },
            EducationOptions = new[]
            {
                "MIT Computer Science", "Stanford University", "Carnegie Mellon University",
                "UC Berkeley", "Georgia Tech", "University of Washington", "University of Texas",
                "Purdue University", "Virginia Tech", "University of Illinois"
            },
            ExperiencePrefixes = new[]
            {
                "Tech Innovations Inc.", "Digital Solutions Ltd.", "CloudTech Systems",
                "Enterprise Software Co.", "Startup Ventures LLC", "Innovation Labs",
                "Software Architects Inc.", "DevOps Masters", "Web Development Studio",
                "Mobile App Company"
            }
        },
        ["Graphic Designer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "Illustrator", "Photoshop", "Figma", "Sketch", "Adobe XD", "InDesign", "CorelDRAW",
                "Canva", "GIMP", "Figma", "Prototyping", "UI Design", "UX Design", "Brand Design",
                "Typography", "Color Theory", "Layout Design", "Web Design", "Print Design"
            },
            EducationOptions = new[]
            {
                "Rhode Island School of Design", "Parsons School of Design", "Pratt Institute",
                "California Institute of the Arts", "School of Visual Arts", "ArtCenter College of Design",
                "Savannah College of Art and Design", "Ringling College of Art and Design",
                "Academy of Art University", "Maryland Institute College of Art"
            },
            ExperiencePrefixes = new[]
            {
                "Creative Digital Agency", "Design Studio Pro", "Brand Innovation Lab",
                "Visual Communications Co.", "UX/UI Design Firm", "Marketing Creative Agency",
                "Digital Art Studio", "Graphic Design Masters", "Visual Branding Company",
                "Creative Solutions Inc."
            }
        },
        ["Data Analyst"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "SQL", "Python", "R", "Tableau", "Power BI", "Excel", "Data Visualization",
                "Statistical Analysis", "Machine Learning", "Pandas", "NumPy", "Jupyter",
                "Google Analytics", "SAS", "SPSS", "Data Mining", "Business Intelligence",
                "Data Warehousing", "ETL", "Dashboard Creation"
            },
            EducationOptions = new[]
            {
                "Stanford University", "MIT", "UC Berkeley", "Harvard University", "Yale University",
                "Princeton University", "Columbia University", "University of Chicago",
                "University of Pennsylvania", "Northwestern University"
            },
            ExperiencePrefixes = new[]
            {
                "DataDriven Solutions", "Analytics Pro Inc.", "Business Intelligence Co.",
                "Data Science Studio", "Market Research Analytics", "Financial Data Firm",
                "Healthcare Analytics", "Retail Analytics Pro", "Sports Analytics Inc.",
                "Social Media Data Co."
            }
        },
        ["Project Manager"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "Agile", "Scrum", "Leadership", "Communication", "Risk Management", "Budget Planning",
                "Team Management", "Stakeholder Management", "Microsoft Project", "JIRA",
                "Trello", "Asana", "PMP", "PRINCE2", "Change Management", "Quality Assurance",
                "Resource Allocation", "Timeline Management", "Documentation"
            },
            EducationOptions = new[]
            {
                "Harvard Business School", "Stanford Graduate School", "Wharton School",
                "MIT Sloan", "Kellogg School of Management", "Chicago Booth", "Columbia Business",
                "Haas School of Business", "Stern School of Business", "Fuqua School of Business"
            },
            ExperiencePrefixes = new[]
            {
                "Global Consulting Group", "Project Management Inc.", "Enterprise Solutions Co.",
                "Strategic Planning Firm", "Business Transformation Co.", "Change Management Pro",
                "IT Project Leaders", "Construction Management", "Product Development Co.",
                "Operations Excellence Inc."
            }
        },
        ["UX Designer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "Figma", "Sketch", "Adobe XD", "User Research", "Wireframing", "Prototyping",
                "Usability Testing", "Information Architecture", "Interaction Design", "Visual Design",
                "Design Systems", "Journey Mapping", "Persona Development", "A/B Testing",
                "Responsive Design", "Accessibility", "Mobile Design", "HTML", "CSS", "JavaScript"
            },
            EducationOptions = new[]
            {
                "Carnegie Mellon University", "Stanford University", "MIT", "Harvard University",
                "UC Berkeley", "University of Washington", "Georgia Tech", "University of Michigan",
                "New York University", "Columbia University"
            },
            ExperiencePrefixes = new[]
            {
                "UX Design Studio", "User Experience Pro", "Digital Product Agency",
                "Innovation Design Lab", "Mobile UX Co.", "Web UX Firm", "App Design Studio",
                "Interface Design Inc.", "Human-Centered Design Co.", "Digital Experience Lab"
            }
        },
        ["DevOps Engineer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Jenkins", "GitLab CI",
                "CircleCI", "Terraform", "Ansible", "Puppet", "Chef", "Linux", "Bash Scripting",
                "Python", "Go", "Monitoring Tools", "Logging", "Security", "Networking"
            },
            EducationOptions = new[]
            {
                "Carnegie Mellon University", "MIT", "Stanford University", "UC Berkeley",
                "Georgia Tech", "University of Illinois", "Purdue University", "University of Texas",
                "University of Washington", "Virginia Tech"
            },
            ExperiencePrefixes = new[]
            {
                "CloudTech Systems", "DevOps Masters", "Infrastructure as Code Co.",
                "Cloud Native Solutions", "Automation Pro", "Platform Engineering Inc.",
                "Site Reliability Engineering", "Cloud Architecture Firm", "DevOps Consulting",
                "Infrastructure Solutions"
            }
        },
        ["Marketing Specialist"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "SEO", "Content Marketing", "Social Media", "Email Marketing", "Google Analytics",
                "Facebook Ads", "LinkedIn Marketing", "Twitter Marketing", "Instagram Marketing",
                "Copywriting", "Brand Strategy", "Market Research", "Campaign Management",
                "Marketing Automation", "Analytics", "A/B Testing", "PPC Advertising"
            },
            EducationOptions = new[]
            {
                "Northwestern University", "University of Pennsylvania", "University of Michigan",
                "UCLA", "University of Texas", "New York University", "Boston University",
                "University of Southern California", "University of North Carolina", "Indiana University"
            },
            ExperiencePrefixes = new[]
            {
                "Digital Marketing Pro", "Creative Agency Co.", "Brand Marketing Inc.",
                "Social Media Masters", "Content Creation Studio", "Advertising Agency",
                "Marketing Analytics Co.", "Growth Hacking Lab", "Email Marketing Pro",
                "SEO Optimization Inc."
            }
        },
        ["Backend Developer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "Java", "Spring Boot", "Node.js", "Python", "Django", "Flask", "Ruby on Rails",
                "PHP", "Laravel", "C#", ".NET Core", "Go", "Rust", "MongoDB", "PostgreSQL",
                "MySQL", "Redis", "REST APIs", "GraphQL", "Microservices", "Docker", "Kubernetes"
            },
            EducationOptions = new[]
            {
                "Carnegie Mellon University", "MIT", "Stanford University", "UC Berkeley",
                "Georgia Tech", "University of Illinois", "University of Washington", "Purdue University",
                "University of Texas", "University of Michigan"
            },
            ExperiencePrefixes = new[]
            {
                "Enterprise Software Co.", "Backend Systems Inc.", "API Development Studio",
                "Database Solutions Co.", "Server Architecture Firm", "Cloud Backend Pro",
                "Microservices Masters", "API Gateway Inc.", "Data Systems Co.", "Enterprise Architecture"
            }
        },
        ["Product Designer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "UI Design", "UX Design", "Figma", "Sketch", "Adobe Creative Suite", "Prototyping",
                "User Research", "Design Thinking", "Design Systems", "Wireframing", "Visual Design",
                "Interaction Design", "Mobile Design", "Web Design", "Typography", "Color Theory",
                "Brand Design", "CSS", "HTML", "JavaScript"
            },
            EducationOptions = new[]
            {
                "Rhode Island School of Design", "Pratt Institute", "California Institute of the Arts",
                "School of Visual Arts", "Parsons School of Design", "ArtCenter College of Design",
                "Savannah College of Art and Design", "Maryland Institute College of Art",
                "Academy of Art University", "Carnegie Mellon University"
            },
            ExperiencePrefixes = new[]
            {
                "Innovation Labs", "Product Design Studio", "Design Strategy Co.",
                "Creative Product Agency", "Design Innovation Lab", "Product UX Firm",
                "Digital Product Design", "User Centered Design Co.", "Design Thinking Studio",
                "Product Experience Inc."
            }
        },
        ["Full Stack Developer"] = new CandidateTemplate
        {
            Skills = new[]
            {
                "JavaScript", "React", "Node.js", "Python", "Django", "TypeScript", "Angular",
                "Vue.js", "MongoDB", "PostgreSQL", "MySQL", "REST APIs", "GraphQL", "Docker",
                "Kubernetes", "AWS", "Azure", "Git", "CI/CD", "HTML", "CSS", "SASS", "Webpack"
            },
            EducationOptions = new[]
            {
                "University of Washington", "Stanford University", "MIT", "UC Berkeley",
                "Carnegie Mellon University", "Georgia Tech", "University of Illinois", "Purdue University",
                "University of Texas", "University of Michigan"
            },
            ExperiencePrefixes = new[]
            {
                "Startup Ventures LLC", "Full Stack Solutions", "Web Development Studio",
                "Digital Innovation Co.", "Tech Startup Inc.", "Web Application Masters",
                "Complete Web Solutions", "End-to-End Development", "Web Technology Pro",
                "Full Stack Agency"
            }
        }
    };

    private class CandidateTemplate
    {
        public string[] Skills { get; set; } = Array.Empty<string>();
        public string[] EducationOptions { get; set; } = Array.Empty<string>();
        public string[] ExperiencePrefixes { get; set; } = Array.Empty<string>();
    }

    public static async Task GenerateAndSaveCandidatesAsync()
    {
        try
        {
            GD.Print("Starting candidate generation...");
            
            var allCandidates = new List<CandidateData>();
            var candidateIdCounter = 1;

            foreach (var position in _templates.Keys)
            {
                var template = _templates[position];
                GD.Print($"Generating 10 candidates for position: {position}");

                for (int i = 0; i < 10; i++)
                {
                    var candidate = GenerateSingleCandidate(position, template, candidateIdCounter);
                    allCandidates.Add(candidate);
                    candidateIdCounter++;
                }
            }

            // Send all candidates to API in batches
            const int batchSize = 50;
            for (int i = 0; i < allCandidates.Count; i += batchSize)
            {
                var batch = allCandidates.Skip(i).Take(batchSize).ToList();
                await SendBatchToApiAsync(batch);
                GD.Print($"Sent batch {i / batchSize + 1}/{(allCandidates.Count + batchSize - 1) / batchSize} ({batch.Count} candidates)");
            }

            GD.Print($"Successfully generated and saved {allCandidates.Count} candidates across {_templates.Keys.Count} positions");
        }
        catch (Exception ex)
        {
            GD.PrintErr($"Error generating candidates: {ex.Message}");
        }
    }

    private static CandidateData GenerateSingleCandidate(string position, CandidateTemplate template, int id)
    {
        var firstName = _firstNames[_random.Next(_firstNames.Length)];
        var lastName = _lastNames[_random.Next(_lastNames.Length)];
        var fullName = $"{firstName} {lastName}";

        // Generate 3-6 random skills
        var skillCount = _random.Next(3, 7);
        var selectedSkills = new List<string>();
        var availableSkills = new List<string>(template.Skills);
        
        for (int i = 0; i < skillCount && availableSkills.Count > 0; i++)
        {
            var skillIndex = _random.Next(availableSkills.Count);
            selectedSkills.Add(availableSkills[skillIndex]);
            availableSkills.RemoveAt(skillIndex);
        }

        // Generate experience years (1-15 years)
        var experienceYears = _random.Next(1, 16);
        
        // Create experience description
        var company = template.ExperiencePrefixes[_random.Next(template.ExperiencePrefixes.Length)];
        var experience = $"{experienceYears} years at {company}";

        return new CandidateData
        {
            candidate_id = $"CAND{id:D3}",
            candidateName = fullName,
            position = position,
            gender = GenerateGender(),
            education = template.EducationOptions[_random.Next(template.EducationOptions.Length)],
            skills = selectedSkills.ToArray(),
            workExperience = experience,
            picturePath = _random.Next(2) == 0 ? "res://assets/icon.svg" : "res://assets/icon2.svg"
        };
    }

    private static string GenerateGender()
    {
        var genders = new[] { "Male", "Female", "Other" };
        return genders[_random.Next(genders.Length)];
    }

    private static async Task SendBatchToApiAsync(List<CandidateData> candidates)
    {
        var requestData = new Godot.Collections.Dictionary
        {
            ["candidates"] = new Godot.Collections.Array()
        };

        foreach (var candidate in candidates)
        {
            var candidateDict = new Godot.Collections.Dictionary
            {
                ["candidate_id"] = candidate.candidate_id,
                ["candidateName"] = candidate.candidateName,
                ["position"] = candidate.position,
                ["gender"] = candidate.gender,
                ["education"] = candidate.education,
                ["workExperience"] = candidate.workExperience,
                ["picturePath"] = candidate.picturePath,
                ["skills"] = new Godot.Collections.Array(candidate.skills.Select(s => (Godot.Variant)s).ToArray())
            };
            ((Godot.Collections.Array)requestData["candidates"]).Add(candidateDict);
        }

        await ApiService.SendCandidatesBatchAsync(requestData);
    }
}