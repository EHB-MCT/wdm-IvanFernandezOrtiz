# Code Conventions - JavaScript/Node.js Backend

## General Principles

- **Consistency over perfection** - Follow existing patterns in the codebase
- **Readability first** - Write code that other developers can understand easily
- **ESLint compliance** - All code must pass ESLint rules
- **Modern JavaScript** - Use ES6+ features when appropriate

## Naming Conventions

### Variables and Functions
- Use **camelCase** for variables and function names
```javascript
const playerName = 'John';
const getPlayerScore = () => { /* ... */ };
```

### Constants
- Use **UPPER_SNAKE_CASE** for constants
```javascript
const MAX_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Classes and Constructors
- Use **PascalCase** for classes and constructor functions
```javascript
class PlayerSession {
  constructor(data) {
    this.data = data;
  }
}
```

### Files
- Use **camelCase.js** for files
- Match file name to main export/class name when possible
```
candidateController.js
playerSessionService.js
```

## Code Style

### Functions
- Use **arrow functions** for callbacks and anonymous functions
- Use **function declarations** for named functions that will be called before definition
- Keep functions small and focused on a single responsibility

```javascript
// Good
const calculateScore = (choices) => {
  return choices.reduce((total, choice) => total + choice.points, 0);
};

function initializeGame(config) {
  // Implementation
  return game;
}
```

### Objects and Arrays
- Use **template literals** for string interpolation
- Use **destructuring** when accessing object properties
- Use **spread operator** for creating copies

```javascript
const player = {
  name: playerName,
  score: calculateScore(choices),
  ...additionalData
};

const { id, name } = player;
const newChoices = [...choices, newChoice];
```

### Error Handling
- Use **async/await** with try-catch blocks for async operations
- Create meaningful error messages
- Log errors appropriately

```javascript
const createCandidate = async (candidateData) => {
  try {
    const candidate = await Candidate.create(candidateData);
    return candidate;
  } catch (error) {
    logger.error('Failed to create candidate:', error);
    throw new Error('Candidate creation failed');
  }
};
```

## Documentation Standards

### JSDoc Comments
- All public functions should have JSDoc comments
- Include parameter types and return types
- Use descriptive parameter and return descriptions

```javascript
/**
 * Creates a new player session with the given configuration.
 * @param {Object} sessionConfig - The session configuration object
 * @param {string} sessionConfig.playerName - The player's name
 * @param {number} sessionConfig.maxRounds - Maximum number of rounds
 * @returns {Promise<PlayerSession>} The created player session
 */
const createPlayerSession = async (sessionConfig) => {
  // Implementation
};
```

### Inline Comments
- Use inline comments to explain complex business logic
- Comment "why" not "what"
- Keep comments up-to-date with code changes

```javascript
// Calculate bias score using weighted average to prioritize recent choices
const biasScore = recentChoices.reduce((weighted, choice) => {
  return weighted + (choice.score * choice.recency);
}, 0) / totalChoices;
```

## File Organization

### Directory Structure
```
src/
├── controllers/     # Route handlers
├── services/        # Business logic
├── models/          # Database models
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── utils/           # Utility functions
└── config/          # Configuration files
```

### Import/Export Order
1. Node.js built-in modules
2. Third-party npm packages
3. Local modules (relative imports)

```javascript
const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');

const Candidate = require('../models/Candidate');
const { validateInput } = require('../utils/validation');
```

## API Design Conventions

### RESTful Routes
- Use **plural nouns** for resource names
- Use **HTTP verbs** appropriately (GET, POST, PUT, DELETE)
- Include **status codes** in responses

```javascript
// GET /api/candidates
// POST /api/candidates
// GET /api/candidates/:id
// PUT /api/candidates/:id
// DELETE /api/candidates/:id
```

### Response Format
- Use consistent response structure
- Include success/error indicators
- Provide meaningful error messages

```javascript
// Success response
{
  success: true,
  data: { /* response data */ },
  message: 'Operation completed successfully'
}

// Error response
{
  success: false,
  error: 'Validation failed',
  details: { /* error details */ }
}
```

## Database Conventions

### Model Naming
- Use **singular PascalCase** for model names
- Use **camelCase** for field names
- Include appropriate validation rules

```javascript
const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  experience: { type: Number, min: 0 },
  skills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});
```

## Testing Conventions

### Test Files
- Use **.test.js** or **.spec.js** suffix for test files
- Place test files in **tests/** directory or alongside source files

### Test Structure
- Use **describe()** to group related tests
- Use **it()** for individual test cases
- Write descriptive test names

```javascript
describe('Candidate Service', () => {
  describe('createCandidate', () => {
    it('should create a candidate with valid data', async () => {
      // Test implementation
    });

    it('should throw error with invalid email', async () => {
      // Test implementation
    });
  });
});
```

## Security Guidelines

### Input Validation
- Always validate user input
- Sanitize data to prevent XSS attacks
- Use parameterized queries to prevent SQL injection

### Authentication/Authorization
- Use JWT for authentication
- Implement proper error handling for auth failures
- Never expose sensitive information in responses

## Performance Guidelines

### Database Queries
- Use indexes for frequently queried fields
- Avoid N+1 query problems
- Use pagination for large datasets

### Memory Management
- Avoid memory leaks in long-running processes
- Use streams for large file operations
- Implement proper cleanup in error scenarios