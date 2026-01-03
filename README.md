# Recruiting API Backend

## Overview
The recruiting API is a Node.js/Express backend that manages candidate information and tracks player choices from a recruiting game. It stores candidate profiles and player decision analytics in a MongoDB database with comprehensive API documentation.

## Architecture
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker
- **Project Structure**: Modular MVC architecture with services layer

## Project Structure
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
│   │   ├── candidateController.js # Candidate CRUD operations
│   │   └── choiceController.js    # Player choice analytics
│   ├── middleware/
│   │   ├── errorHandler.js    # Centralized error handling
│   │   ├── security.js        # Security middleware
│   │   └── validation.js      # Input validation middleware
│   ├── models/
│   │   ├── Candidate.js       # Candidate data model
│   │   └── PlayerChoices.js   # Player choice data model
│   ├── routes/
│   │   ├── candidateRoutes.js # Candidate API endpoints
│   │   └── choiceRoutes.js    # Choice analytics endpoints
│   ├── services/
│   │   ├── candidateGeneratorService.js # Random candidate generation
│   │   ├── candidateService.js         # Candidate business logic
│   │   ├── candidateTemplateEngine.js  # Template-based generation
│   │   └── choiceService.js            # Choice analytics logic
│   └── utils/
│       └── responseHelpers.js # Standardized API responses
├── server.js               # Main application entry point
├── package.json
├── dockerfile
└── .env.example           # Environment variables template
```

## API Documentation
Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api-docs`

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

### PlayerChoices Model
Tracks player decisions with the following fields:
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

## Environment Variables
- `MONGO_URI`: MongoDB connection string (required)
- `PORT`: Server port (default: 5000)
- `API_URL`: Base URL for API documentation (default: http://localhost:5000)
- `NODE_ENV`: Environment mode (development/production)
- `CORS_ORIGIN`: CORS allowed origin (default: http://localhost:3000)
- `CORS_CREDENTIALS`: Enable CORS credentials (default: true)

## Features

### Input Validation
- All POST requests are validated for required fields and data types
- Parameter validation for route parameters
- Detailed error messages for validation failures

### Error Handling
- Comprehensive error handling with appropriate HTTP status codes
- Structured error responses with details
- Production-safe error messages
- Request context logging

### Database Connection
- Connection pooling with configurable settings
- Automatic reconnection on connection loss
- Graceful shutdown handling
- Connection event logging

## Docker Setup
The backend runs in a Docker container with:
- Node.js 20 base image
- Exposed port 5000
- Dependency on MongoDB service
- Environment variable configuration

## Development

### Running Locally
```bash
npm install
npm run dev
```

The development server uses nodemon for hot-reloading.

### Accessing Documentation
Start the server and visit `http://localhost:5000/api-docs` for interactive API documentation.

### Key Features

#### Candidate Generation
- Random candidate generation using template engine
- Configurable position, education, and skill distributions
- Batch creation with validation
- Seeded generation for reproducible data

#### Choice Analytics
- Comprehensive player behavior tracking
- Aggregated analytics and statistics
- Multi-dimensional filtering (player, candidate, time)
- Tab viewing pattern analysis

#### Data Management
- Full CRUD operations for candidates
- Batch operations for efficient data handling
- Database integrity with proper indexing
- Graceful error handling and validation

## Error Responses
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