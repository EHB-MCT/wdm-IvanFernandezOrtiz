# Recruiting Game Platform

## Overview
A comprehensive recruiting simulation platform consisting of a Node.js/Express backend API and a Godot C# frontend game. The platform manages candidate information, tracks player choices, and provides analytics for recruitment bias research. The backend stores candidate profiles and player decision analytics in a MongoDB database with comprehensive API documentation, while the Godot frontend provides an interactive recruiting game experience.

## Architecture

### Backend (recruiting-api)
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker
- **Project Structure**: Modular MVC architecture with services layer

### Frontend (recruiting-game)
- **Engine**: Godot 4.5
- **Language**: C#
- **Architecture**: Component-based with service layer
- **API Integration**: RESTful API client for backend communication
- **Project Structure**: Modular C# project with Core, Components, and Services

## Project Structure

### Backend (recruiting-api)
```
recruiting-api/
├── src/
│   ├── config/
│   │   └── app/
│   │       ├── config.js        # Application configuration
│   │       ├── database.js      # Database connection configuration
│   │       └── swagger.js       # API documentation setup
│   │   └── data/
│   │       ├── companies.json   # Company data for generation
│   │       ├── education.json   # Education options
│   │       ├── names.json       # Name databases
│   │       └── positions.json   # Job positions
│   ├── controllers/
│   │   ├── adminController.js       # Admin dashboard and analytics
│   │   ├── candidateController.js   # Candidate CRUD operations
│   │   ├── choiceController.js     # Player choice analytics
│   │   ├── migrationController.js  # Data migration utilities
│   │   └── playerSessionController.js # Player session management
│   ├── middleware/
│   │   ├── errorHandler.js    # Centralized error handling
│   │   ├── security.js        # Security middleware
│   │   └── validation.js      # Input validation middleware
│   ├── models/
│   │   ├── Candidate.js       # Candidate data model
│   │   ├── PlayerChoices.js   # Legacy player choice model
│   │   └── PlayerSession.js   # Session-based player tracking
│   ├── routes/
│   │   ├── adminRoutes.js     # Admin dashboard endpoints
│   │   ├── candidateRoutes.js # Candidate API endpoints
│   │   ├── choiceRoutes.js    # Choice analytics endpoints
│   │   ├── migrationRoutes.js # Migration utilities
│   │   └── playerSessionRoutes.js # Session management endpoints
│   ├── services/
│   │   ├── candidateGeneratorService.js # Random candidate generation
│   │   ├── candidateService.js         # Candidate business logic
│   │   ├── candidateTemplateEngine.js  # Template-based generation
│   │   └── choiceService.js            # Choice analytics logic
│   └── utils/
│       └── responseHelpers.js # Standardized API responses
├── public/
│   └── admin.html           # Admin dashboard interface
├── server.js               # Main application entry point
├── package.json
├── dockerfile
└── .env.example           # Environment variables template
```

### Frontend (recruiting-game)
```
recruiting-game/
├── Assets/
│   ├── icon.svg           # Game icons
│   └── icon.svg.import    # Import configurations
├── Scenes/
│   ├── main.tscn          # Main game scene
│   └── resume.tscn        # Resume viewing scene
├── Scripts/
│   ├── Components/        # UI components
│   │   ├── Main.cs        # Main component logic
│   │   └── Resume.cs      # Resume component
│   ├── Core/              # Core game logic
│   │   ├── CandidateLoader.cs   # Candidate data management
│   │   ├── GameManager.cs       # Main game controller
│   │   ├── RoundManager.cs       # Game round management
│   │   └── UIManager.cs          # UI state management
│   └── Services/          # Service layer
│       ├── ApiService.cs          # Base API service
│       ├── Api/
│       │   ├── ApiClient.cs           # HTTP client wrapper
│       │   ├── CandidateApiService.cs  # Candidate API integration
│       │   └── GameLogApiService.cs    # Game logging API
│       └── UI/
│           ├── ResumeController.cs    # Resume UI controller
│           ├── ResumeDataBinder.cs     # Data binding logic
│           └── ResumeView.cs           # Resume view component
├── data/
│   └── candidates.json     # Local candidate data
├── project.godot         # Godot project configuration
├── RecruitingGame.csproj # C# project file
├── RecruitingGame.sln    # Solution file
└── .env.example          # Environment variables template
```

## Quick Start

### Using Docker Compose
```bash
# Start both backend and database
docker-compose up -d

# Access services
# API: http://localhost:5000
# API Documentation: http://localhost:5000/api-docs
# Admin Dashboard: http://localhost:5000/admin
# MongoDB: localhost:27017
```

### Manual Setup

#### Backend
```bash
cd recruiting-api
npm install
npm run dev
```

#### Frontend
```bash
# Open recruiting-game/project.godot in Godot 4.5
# Run the project from the Godot editor
```

## API Documentation
Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Admin Dashboard**: `http://localhost:5000/admin`

## API Endpoints

### Candidates API

#### GET `/api/candidates`
Retrieves all candidates with pagination support.

**Query Parameters**:
- `limit` (optional): Maximum number of candidates to return (default: 100, max: 1000)
- `offset` (optional): Number of candidates to skip (default: 0)

**Response**: Array of candidate objects

#### POST `/api/candidates`
Creates a new candidate.

**Request Body**: Complete candidate object with required fields
**Response**: `201` with created candidate data

#### DELETE `/api/candidates/{candidateId}`
Deletes a specific candidate.

**Parameters**: `candidateId` (path): Candidate identifier
**Response**: Success confirmation or 404 if not found

#### GET `/api/candidates/generate`
Generates random candidates using template engine.

**Query Parameters**:
- `count` (optional): Number to generate (default: 100, max: 1000)
- `seed` (optional): Seed for reproducible generation

**Response**: Generation statistics and candidate count

#### DELETE `/api/candidates/clear`
Deletes all candidates from database.

**Response**: Success confirmation with deletion count

### Player Choices API

#### POST `/api/choices`
Records a player's choice between candidates.

**Request Body**:
```json
{
  "player_id": "string",
  "chosen_candidate_id": "string",
  "rejected_candidate_id": "string",
  "position": "string",
  "time_taken": "number",
  "tabs_viewed": ["PROFILE", "SKILLS", "WORK", "EDUCATION"],
  "round_number": "number"
}
```

**Response**: `201` with choice ID

#### GET `/api/choices`
Retrieves all choices with candidate details.

**Query Parameters**:
- `limit` (optional): Maximum choices to return (default: 100)
- `offset` (optional): Number to skip for pagination

**Response**: Array of choices with populated candidate data

#### GET `/api/choices/player/{playerId}`
Retrieves choices for a specific player.

**Response**: Array of player's choices with candidate details

#### GET `/api/choices/candidate/{candidateId}`
Retrieves choices where a candidate was chosen or rejected.

**Response**: Array of choices involving the specified candidate

#### POST `/api/choices/batch`
Creates multiple choices efficiently (max 100 per batch).

**Request Body**: Array of choice objects
**Response**: Success confirmation with created IDs

#### GET `/api/choices/analytics`
Provides aggregated analytics for all choices.

**Response**: Analytics including total choices, average time, unique players/candidates, popular tabs and positions

#### GET `/api/choices/details`
Returns all choices with complete candidate information using aggregation.

**Query Parameters**:
- `playerId` (optional): Filter by player
- `candidateId` (optional): Filter by candidate
- `limit` (optional): Maximum results

**Response**: Detailed choice data with full candidate information

#### DELETE `/api/choices/clear`
Deletes all player choices from database.

**Response**: Success confirmation with deletion count

### Player Sessions API

#### POST `/api/sessions`
Creates a new player session for tracking game progress.

**Request Body**:
```json
{
  "player_id": "string",
  "max_rounds": 10
}
```

**Response**: `201` with session ID

#### POST `/api/sessions/{sessionId}/choices`
Adds a choice to an existing session.

**Request Body**:
```json
{
  "round_number": "number",
  "chosen_candidate_id": "string", 
  "rejected_candidate_id": "string",
  "position": "string",
  "time_taken": "number",
  "tabs_viewed": ["PROFILE", "SKILLS", "WORK", "EDUCATION"]
}
```

**Response**: Updated session status

#### GET `/api/sessions/{sessionId}`
Retrieves specific session with populated candidate details.

**Response**: Complete session data with choices

#### GET `/api/sessions`
Retrieves all player sessions with pagination.

**Query Parameters**:
- `limit` (optional): Maximum sessions to return (default: 100)
- `offset` (optional): Number to skip for pagination

**Response**: Array of session objects

#### POST `/api/sessions/{sessionId}/end`
Ends a player session and sets status to completed/abandoned.

**Response**: Final session statistics

#### GET `/api/sessions/analytics`
Provides aggregated session analytics.

**Response**: Session statistics including completion rates, average rounds, and time metrics

#### DELETE `/api/sessions/clear`
Deletes all player sessions from database.

**Response**: Success confirmation with deletion count

### Admin API

#### GET `/admin`
Serves the admin dashboard interface.

**Response**: Admin dashboard HTML page

#### GET `/admin/choices`
Retrieves all player choices with candidate details for admin view.

**Query Parameters**:
- `limit` (optional): Maximum choices to return
- `offset` (optional): Number to skip for pagination
- `playerId` (optional): Filter by specific player

**Response**: Detailed choice data with candidate information

#### GET `/admin/players`
Retrieves list of unique players with session analysis.

**Response**: Player statistics and session summaries

#### GET `/admin/analytics/bias`
Provides comprehensive bias analytics across all player choices.

**Response**: Demographic analytics including gender, race, and age bias metrics

#### DELETE `/admin/clear-all`
Clears all sessions and choices from database.

**Response**: Success confirmation with deletion counts

### Migration API

#### POST `/migrate/sessions`
Migrates existing individual choices to session-based structure.

**Response**: Migration statistics and confirmation

### System Endpoints

#### GET `/`
Health check endpoint.

**Response**: Server status with version and environment info

#### GET `/api-docs`
Interactive API documentation (Swagger UI).

## Data Models

### Candidate Model
Stores candidate information with the following fields:
- `candidate_id`: Unique identifier (required, indexed)
- `candidateName`: Full name (required)
- `gender`: Male/Female/Other (required, indexed)
- `position`: Job position (required, indexed)
- `education`: Educational background (required)
- `workExperience`: Professional experience (required)
- `skills`: Array of skills (required)
- Timestamps: createdAt, updatedAt

**Indexes**:
- Unique index on `candidate_id`
- Indexes on `position` and `gender` for filtering

### PlayerChoices Model (Legacy)
Tracks individual player decisions with the following fields:
- `player_id`: Unique player identifier (indexed)
- `chosen_candidate_id`: Selected candidate ID (indexed, references Candidate)
- `rejected_candidate_id`: Rejected candidate ID (indexed, references Candidate)
- `position`: Role being recruited for (required)
- `time_taken`: Decision time in seconds (required, non-negative)
- `tabs_viewed`: Array of viewed tabs [PROFILE, SKILLS, WORK, EDUCATION] (required)
- `round_number`: Game round number (required, indexed)
- `timestamp`: When choice was made (indexed, descending)
- Timestamps: createdAt, updatedAt

**Indexes**:
- `player_id` for player-based queries
- `chosen_candidate_id` and `rejected_candidate_id` for candidate analytics
- `round_number` for game progression tracking
- `timestamp` for chronological sorting

### PlayerSession Model
Modern session-based tracking for player game sessions:
- `session_id`: Unique session identifier (required, indexed)
- `player_id`: Player identifier (indexed, can have multiple sessions)
- `choices`: Array of embedded choice documents with:
  - `round_number`: Round number in game (1-10)
  - `chosen_candidate_id`: Selected candidate ID (references Candidate)
  - `rejected_candidate_id`: Rejected candidate ID (references Candidate)
  - `position`: Role being recruited for
  - `time_taken`: Decision time in seconds
  - `tabs_viewed`: Array of viewed tab types
  - `timestamp`: When choice was made
- `start_time`: When session started (default: current time)
- `end_time`: When session ended
- `status`: Session status [active, completed, abandoned] (default: active)
- `total_rounds_completed`: Number of rounds completed (calculated)
- `total_time_taken`: Total time for all choices in seconds (calculated)
- `max_rounds`: Maximum rounds for this session (default: 10)
- Timestamps: createdAt, updatedAt

**Indexes**:
- `session_id` for unique session lookup
- `player_id` for player-based session queries
- `start_time` for chronological sorting
- `status` for filtering active/completed sessions

**Calculated Fields**:
- `total_rounds_completed` and `total_time_taken` are automatically calculated on save

## Environment Variables
- `MONGO_URI`: MongoDB connection string (required)
- `PORT`: Server port (default: 5000)
- `API_URL`: Base URL for API documentation (default: http://localhost:5000)
- `NODE_ENV`: Environment mode (development/production)
- `CORS_ORIGIN`: CORS allowed origin (default: http://localhost:3000)
- `CORS_CREDENTIALS`: Enable CORS credentials (default: true)

## Features

### Backend Features

#### Input Validation
- All POST requests are validated for required fields and data types
- Parameter validation for route parameters
- Detailed error messages for validation failures

#### Error Handling
- Comprehensive error handling with appropriate HTTP status codes
- Structured error responses with details
- Production-safe error messages
- Request context logging

#### Database Connection
- Connection pooling with configurable settings
- Automatic reconnection on connection loss
- Graceful shutdown handling
- Connection event logging

#### Session Management
- Session-based player tracking with configurable round limits
- Automatic session completion when max rounds reached
- Session abandonment detection for incomplete games
- Comprehensive session analytics

#### Admin Dashboard
- Web-based admin interface for viewing player data
- Real-time bias analytics across demographics
- Player performance tracking and session analysis
- Data management utilities

#### Data Migration
- Automated migration from individual choices to session structure
- Preserves historical data while updating data model
- Session grouping based on timestamp patterns

### Frontend Features

#### Game Engine
- Godot 4.5 C# implementation
- Component-based architecture for maintainability
- Service layer for API integration
- Responsive UI with dynamic candidate loading

#### Candidate Presentation
- Tabbed resume interface (Profile, Skills, Work, Education)
- Dynamic content binding from API data
- Interactive candidate comparison system
- Time tracking and tab view analytics

#### Game Management
- Round-based gameplay with configurable session limits
- Player session integration with backend API
- Real-time choice tracking and submission
- Game state management and progression

#### API Integration
- RESTful API client with error handling
- Candidate data fetching and caching
- Game event logging and analytics submission
- Session management integration

## Docker Setup

### Docker Compose Configuration
The platform uses Docker Compose for complete deployment:

#### MongoDB Database
- Image: `mongo:latest`
- Port: `27017:27017`
- Volume: `mongo_data:/data/db` for persistent storage
- Configurable authentication via environment variables

#### API Backend
- Build context: `./recruiting-api`
- Port: `5000:5000`
- Health check: `/` endpoint every 30 seconds
- Volume mounts for development:
  - `./recruiting-api:/app` - Live code reloading
  - `./recruiting-game:/recruiting-game` - Game data access
- Depends on: MongoDB service
- Environment variables for configuration

### Running the Platform

#### Production Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Development Setup
```bash
# Start with volume mounts for development
docker-compose up

# Backend hot-reloads on code changes
# Game data accessible from backend
```

### Environment Configuration

#### Backend Environment Variables (.env)
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `API_URL`: Base URL for API documentation
- `NODE_ENV`: Environment mode (development/production)
- `CORS_ORIGIN`: CORS allowed origin (default: http://localhost:3000)
- `CORS_CREDENTIALS`: Enable CORS credentials (default: true)

#### Frontend Environment Variables (.env)
- API endpoint configuration
- Player identification settings
- Game configuration parameters

## Development

### Backend Development
```bash
cd recruiting-api
npm install
npm run dev
```

The development server uses nodemon for hot-reloading.

### Frontend Development
```bash
# Open in Godot 4.5 editor
# Run project directly from editor
# Use F5 or play button to launch game
```

### Development Tools

#### Backend Tools
- Nodemon for hot-reloading
- MongoDB Compass for database management
- Postman/Insomnia for API testing
- Swagger UI for interactive documentation

#### Frontend Tools
- Godot 4.5 editor with C# support
- Visual Studio/VS Code for C# development
- .NET debugging tools
- Godot debugger integration

### Code Standards

#### JavaScript/Node.js Standards
- See `CONVENTIONS.md` for backend coding standards
- ESLint configuration for code quality
- ES6+ module syntax
- Async/await for asynchronous operations

#### C# Standards
- See `STANDARDS.md` for comprehensive C# coding standards
- PascalCase for public members, camelCase for locals
- File-scoped namespaces
- Modern C# features and LINQ usage

### Testing the Platform

#### API Testing
```bash
# Start backend
npm run dev

# Access endpoints
curl http://localhost:5000/
# Visit http://localhost:5000/api-docs
```

#### Game Testing
```bash
# Start backend first (required)
# Open project in Godot
# Run game from editor
# Verify API connection in game console
```

#### Integration Testing
```bash
# Generate test candidates
curl -X POST http://localhost:5000/api/candidates/generate?count=50

# Create test session
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"player_id": "test_player", "max_rounds": 5}'

# Play game rounds and verify data persistence
```

### Key Features

#### Candidate Generation
- Random candidate generation using template engine
- Configurable position, education, and skill distributions
- Batch creation with validation
- Seeded generation for reproducible data
- Demographic diversity for bias testing

#### Session Analytics
- Session-based player tracking
- Comprehensive player behavior analytics
- Multi-dimensional filtering (player, candidate, time)
- Tab viewing pattern analysis
- Demographic bias detection and reporting

#### Data Management
- Full CRUD operations for candidates
- Session management with choice tracking
- Batch operations for efficient data handling
- Database integrity with proper indexing
- Migration utilities for data model updates

#### Admin Interface
- Web-based dashboard for data visualization
- Real-time analytics and bias metrics
- Player session monitoring
- Data export and management utilities

## Game Architecture

### Core Components

#### GameManager (recruiting-game/Scripts/Core/GameManager.cs)
- Main game controller and state management
- Coordinates between UI, API, and game logic
- Handles scene transitions and game initialization

#### RoundManager (recruiting-game/Scripts/Core/RoundManager.cs)
- Manages game round progression
- Tracks player choices and timing
- Coordinates candidate selection and API calls

#### UIManager (recruiting-game/Scripts/Core/UIManager.cs)
- Centralized UI state management
- Handles UI updates and user interactions
- Manages resume view and selection interfaces

#### CandidateLoader (recruiting-game/Scripts/Core/CandidateLoader.cs)
- Manages candidate data fetching and caching
- Handles API communication for candidate data
- Provides data binding services to UI components

### Service Layer

#### API Services
- `ApiClient.cs`: Base HTTP client with error handling
- `CandidateApiService.cs`: Candidate-specific API operations
- `GameLogApiService.cs`: Game event logging and analytics

#### UI Services
- `ResumeController.cs`: Resume display logic and interactions
- `ResumeView.cs`: Resume UI component management
- `ResumeDataBinder.cs`: Data binding between API and UI

## API Response Format

### Success Responses
```json
{
  "status": "ok",
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Responses
All errors follow a consistent format:
```json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate entries)
- `500`: Internal Server Error

## Analytics and Reporting

### Bias Analytics
The platform provides comprehensive bias analysis across:
- **Gender**: Selection rates by gender
- **Race**: Hiring patterns by demographic groups
- **Age**: Age range selection preferences
- **Position**: Bias patterns by job type

### Session Analytics
- **Completion Rates**: Percentage of games completed
- **Time Metrics**: Average time per decision and session
- **Tab Usage**: Information viewing patterns
- **Player Behavior**: Repeated player analysis

### Admin Dashboard
Access the admin dashboard at `http://localhost:5000/admin` for:
- Real-time player activity monitoring
- Demographic analytics visualization
- Session and player management
- Data export and cleanup utilities

