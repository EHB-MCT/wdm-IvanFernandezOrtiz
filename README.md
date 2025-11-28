# Recruiting API Backend

## Overview
The recruiting API is a Node.js/Express backend that logs and retrieves player interaction data from a recruiting game. It stores candidate information and player behavior analytics in a MongoDB database.

## Architecture
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB
- **Containerization**: Docker

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

**Response**: `201` with `{"status": "ok"}` on success

### GET `/api/log`
Retrieves all logged player data from the database.

**Response**: Array of all player logs

### GET `/`
Health check endpoint.

**Response**: `"Recruiting API running"`

## Data Model
The `PlayerLog` schema stores:
- Player and candidate identifiers
- Candidate demographics (gender, position, education, experience, skills)
- Player behavior (tabs viewed, time taken)
- Automatic timestamp

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)

## Docker Setup
The backend runs in a Docker container with:
- Node.js 20 base image
- Exposed port 5000
- Dependency on MongoDB service

## Database Connection
Uses Mongoose to connect to MongoDB and automatically creates the `playerlogs` collection for storing interaction data.

## Error Handling
- POST endpoint: Returns 500 on database save failures
- GET endpoint: Returns 500 on database query failures
- All errors logged to console