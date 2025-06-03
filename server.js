const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const problemRoutes = require('./routes/problemRoutes');
const pool = require('./config/db');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logger
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
allowedOrigins.push('null'); // Allow null origin for development/testing

app.use(cors({
    origin: (origin, callback) => {
        console.log('Request Origin:', origin);
        if (!origin || allowedOrigins.includes(String(origin))) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Root route — simple check endpoint to avoid "Cannot GET /"
app.get('/', (req, res) => {
    res.send('Internet Problem Solver API is running');
});

// Use API routes with version fallback
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/problems`, problemRoutes);

// (Optional) Serve frontend static files if deployed in same repo
// Uncomment and adjust folder if you have frontend build output
// app.use(express.static(path.join(__dirname, 'client', 'build')));
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    await pool.end();
    process.exit(0);
});
