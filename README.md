# Recruiting API Backend

## Overview
The recruiting API is a Node.js/Express backend that logs and retrieves player interaction data from a recruiting game. It stores candidate information and player behavior analytics in a MongoDB database.

## Architecture
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker
- **Project Structure**: Modular MVC architecture with src folder

## Project Structure
```
recruiting-api/
├── src/
│   ├── config/
│   │   ├── database.js     # Database connection configuration
│   │   └── swagger.js      # API documentation setup
│   ├── controllers/
│   │   └── logController.js # Business logic for log operations
│   ├── middleware/
│   │   ├── validation.js   # Input validation middleware
│   │   └── errorHandler.js # Error handling middleware
│   ├── models/
│   │   └── PlayerLog.js    # Mongoose data model
│   └── routes/
│       └── logRoutes.js     # API route definitions
├── server.js               # Main application entry point
├── package.json
└── dockerfile
```

## API Documentation
Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api-docs`

## API Endpoints

### POST `/api/log`
Logs player interaction data with candidate information.

**Request Body**:
```json
{
  "player_id": "string",
  "candidate_id": "string", 
  "candidate_gender": "string",
  "candidate_position": "string",
  "candidate_education": "string",
  "candidate_workExperience": "string",
  "candidate_skills": ["string"],
  "tabs_viewed": ["string"],
  "time_taken": "number"
}
```

**Response**: `201` with `{"status": "ok", "id": "log_id"}` on success

### GET `/api/log`
Retrieves all logged player data from the database.

**Response**: Array of all player logs sorted by timestamp (newest first)

### GET `/api/log/player/{playerId}`
Retrieves logs for a specific player.

**Parameters**:
- `playerId` (path): Player identifier

**Response**: Array of logs for the specified player

### GET `/api/log/candidate/{candidateId}`
Retrieves logs for a specific candidate.

**Parameters**:
- `candidateId` (path): Candidate identifier

**Response**: Array of logs for the specified candidate

### GET `/`
Health check endpoint.

**Response**: `"Recruiting API running"`

### GET `/api-docs`
Interactive API documentation (Swagger UI).

## Data Model
The `PlayerLog` schema stores:
- Player and candidate identifiers
- Candidate demographics (gender, position, education, experience, skills)
- Player behavior (tabs viewed, time taken)
- Automatic timestamps (createdAt, updatedAt, timestamp)

**Indexes**:
- `player_id` for player-based queries
- `candidate_id` for candidate-based queries
- `timestamp` for chronological sorting

## Environment Variables
- `MONGO_URI`: MongoDB connection string (required)
- `PORT`: Server port (default: 5000)
- `API_URL`: Base URL for API documentation (default: http://localhost:5000)
- `NODE_ENV`: Environment mode (development/production)

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
npm start
```

### Accessing Documentation
Start the server and visit `http://localhost:5000/api-docs` for interactive API documentation.

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