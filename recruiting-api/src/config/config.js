// API Configuration
export const config = {
    port: process.env.PORT || 5000,
    apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`,
    mongo: {
        uri: process.env.MONGO_URI,
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        credentials: process.env.CORS_CREDENTIALS === "true"
    }
};

// Validate required environment variables
export const validateConfig = () => {
    const required = ['MONGO_URI'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.log('Please check your .env file and add the missing variables.');
        return false;
    }
    
    console.log('✅ Configuration validated successfully');
    console.log(`🌐 API will run on port: ${config.port}`);
    console.log(`🔗 MongoDB URI: ${config.mongo.uri ? config.mongo.uri.replace(/\/\/.*@/, '//***:***@') : 'Not configured'}`);
    return true;
};