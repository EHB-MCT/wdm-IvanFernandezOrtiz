# Research Methodology and Sources

## Research Objectives

This study aims to investigate unconscious hiring biases through an interactive simulation that tracks participants' candidate selection patterns. The research focuses on identifying systematic biases related to demographic factors, educational background, and professional experience.

## Hypothesis

**Primary Hypothesis**: Hiring managers exhibit unconscious biases in candidate selection based on demographic indicators (gender, ethnicity, age), educational pedigree, and career trajectory patterns.

**Secondary Hypotheses**:
1. Candidates from prestigious educational institutions receive preferential treatment despite equal qualifications
2. Gender biases manifest differently across technical vs. non-technical positions
3. Ethnic name recognition influences initial candidate screening decisions

## Methodology Overview

### Experimental Design

**Research Type**: Experimental simulation with quantitative bias measurement

**Data Collection**: Automated logging of participant decisions in controlled candidate selection scenarios

**Sample Size**: 10 rounds per participant (noted limitation - see Results.md)

**Control Variables**: 
- Candidate qualifications (normalized experience and skill levels)
- Position requirements (consistent across all candidates)
- Information presentation format (standardized resume layout)

**Independent Variables**:
- Candidate demographic indicators (names, implied gender/ethnicity)
- Educational institution prestige tiers
- Career progression patterns

**Dependent Variables**:
- Selection/rejection rates
- Time to decision
- Preference patterns across demographic categories

## Candidate Generation Methodology

### Data Sources

#### Demographic Data
**Names Database**: 
- Source: U.S. Census Bureau name frequency data (2010-2020)
- Compilation: 50 male names, 50 female names, 100 surnames
- Ethnicity Indicators: Names coded by probable ethnic association based on U.S. demographic studies
- Reference: "The Demographic Statistical Atlas of the United States" - Statistical Atlas

**Name-to-Ethnicity Mapping**: Based on research from:
- "What's in a Name? Evidence from Name-Based Discrimination Studies" - National Bureau of Economic Research
- U.S. Social Security Administration name databases and demographic correlations

#### Educational Institutions
**Institution Classification**:
- Tier 1 (Ivy League/Elite): MIT, Stanford, Harvard, etc.
- Tier 2 (Major Research Universities): UC Berkeley, Georgia Tech, etc.
- Tier 3 (Regional/State Universities): Various state university systems
- Source: U.S. News & World Report College Rankings 2023
- Additional: National Center for Education Statistics (NCES) data

#### Professional Experience
**Company Data**: 
- Fortune 500 companies for "prestigious" experience
- Regional companies for "standard" experience
- Startup companies for "innovative" experience profiles
- Source: Fortune 500 lists, Crunchbase startup database

#### Skills and Qualifications
**Technical Skills**: Based on LinkedIn job market analysis 2023
**Skill Levels**: Normalized across all candidates using competency frameworks
- Source: O*NET occupational database (U.S. Department of Labor)
- Additional reference: Stack Overflow Developer Survey 2023

### Candidate Generation Algorithm

1. **Demographic Assignment**: Random selection from categorized name databases
2. **Educational Background**: Weighted random assignment with 30% Tier 1, 40% Tier 2, 30% Tier 3
3. **Experience Generation**: 5-15 years of experience with logical career progression
4. **Skills Standardization**: 10-15 skills per candidate, balanced across technical and soft skills
5. **Quality Control**: All candidates meet minimum qualification thresholds

**Bias Mitigation in Generation**:
- Equal distribution of qualifications across demographic groups
- Random assignment prevents systematic advantages
- Validation ensures comparable candidate pools

## Simulation Design

### Game Mechanics

**Round Structure**: 
- 4 candidates per round
- 1 selection required per round
- 10 rounds total per session

**Candidate Pool**: 
- Dynamic generation ensures variety
- Demographic diversity enforced per round
- Comparable qualifications across all options

**Interface Design**:
- Standardized resume format across all candidates
- Consistent information ordering and presentation
- Blind formatting for initial bias measurement (names removed in experimental variants)

### Data Collection Protocol

#### Primary Metrics
1. **Selection Patterns**: Which candidates chosen vs. rejected
2. **Decision Time**: Time taken to make each selection
3. **Demographic Correlation**: Analysis of selection patterns by demographic categories
4. **Educational Bias**: Preference for institution tiers
5. **Experience Weighting**: Valuation of company prestige vs. role progression

#### Secondary Metrics
1. **Consistency Patterns**: Participant's internal logic and consistency
2. **Learning Effects**: Changes in patterns over multiple rounds
3. **Speed-Accuracy Tradeoffs**: Relationship between decision time and selection quality

#### Data Storage
- MongoDB for structured data storage
- Timestamp precision for temporal analysis
- Anonymous participant codes for privacy
- JSON format for flexible data structure

## Statistical Analysis Plan

### Primary Analyses

1. **Chi-Square Tests**: Compare selection rates across demographic categories
2. **T-Tests**: Compare decision times for different candidate types
3. **Regression Analysis**: Identify predictive factors for selection decisions
4. **Cluster Analysis**: Identify participant decision-making patterns

### Bias Detection Metrics

1. **Demographic Bias Index**: 
   ```
   DBI = (Selection Rate for Group A - Selection Rate for Group B) / Overall Selection Rate
   ```

2. **Educational Prestige Bias**:
   ```
   EPB = (Tier 1 Selection Rate - Tier 3 Selection Rate) / Overall Selection Rate
   ```

3. **Consistency Score**:
   ```
   CS = Number of Qualifications-Based Decisions / Total Decisions
   ```

### Statistical Power Considerations

**Effect Size Detection**: Small to medium effects (d = 0.3)
**Confidence Level**: 95% (α = 0.05)
**Power**: 80% (β = 0.20)

*Note: Current 10-round sample size may be insufficient for detecting small effects - see Results.md*

## Ethical Considerations

### Research Ethics
- **Informed Consent**: Participants informed about data collection and research purposes
- **Anonymity**: All data stored anonymously with participant codes
- **Data Security**: Encrypted storage and secure data transmission
- **Right to Withdraw**: Participants can delete their data at any time

### Bias Mitigation
- **Diverse Candidate Generation**: Balanced representation across all demographic groups
- **Objective Qualification Standards**: Clear, measurable criteria for all candidates
- **Algorithmic Fairness**: Random generation prevents systematic advantages

## Validity and Limitations

### Internal Validity
**Strengths**:
- Controlled experimental environment
- Standardized candidate presentation
- Automated data collection reduces observer bias

**Threats**:
- Limited external validity of game-based decisions
- Potential for strategic gaming vs. authentic decision-making
- Limited sample size per participant

### External Validity
**Strengths**:
- Realistic candidate profiles based on actual job market data
- Diverse participant pool (when deployed broadly)
- Multiple decision contexts (different positions available)

**Limitations**:
- Artificial time constraints compared to real hiring processes
- Limited information compared to full candidate evaluation
- Single-round decisions vs. multi-stage real hiring processes

## Data Sources and References

### Primary Data Sources
1. **U.S. Census Bureau**: Demographic and name frequency data
2. **U.S. Department of Education**: College and university data
3. **Bureau of Labor Statistics**: Occupational information and employment data
4. **LinkedIn Economic Insights**: Job market and skill requirement data

### Academic References
1. **Bertrand, M., & Mullainathan, S.** (2004). "Are Emily and Greg More Employable Than Lakisha and Jamal? A Field Experiment on Labor Market Discrimination." American Economic Review.
2. **National Bureau of Economic Research**: Multiple studies on name-based discrimination
3. **Harvard Business Review**: Research on unconscious bias in hiring
4. **MIT Center for Collective Intelligence**: Studies on decision-making patterns

### Industry References
1. **Google re:Work**: Research on unbiased hiring practices
2. **McKinsey & Company**: Diversity and inclusion research reports
3. **Deloitte**: Human Capital trends and bias research

## Quality Assurance Measures

### Data Validation
- Cross-validation of demographic classifications
- Expert review of candidate profiles for realism
- Statistical validation of qualification distributions

### Algorithm Validation
- Testing of random generation for bias
- Quality control checks on candidate pool diversity
- Automated validation of qualification consistency

### Research Protocol
- Pre-registered analysis plan where applicable
- Peer review of methodology
- Transparent reporting of limitations

## Future Research Directions

### Immediate Enhancements
1. **Increased Sample Size**: More rounds per participant for statistical power
2. **Demographic Controls**: Systematic control variables for participant demographics
3. **Longitudinal Studies**: Track bias changes over time and interventions

### Long-term Research
1. **Intervention Studies**: Test bias-reduction training effectiveness
2. **Cross-cultural Studies**: Compare biases across different cultural contexts
3. **Machine Learning Integration**: Advanced pattern recognition for bias detection