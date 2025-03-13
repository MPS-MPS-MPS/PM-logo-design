const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Debug route registration
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));

// Debug 404 handler
app.use((req, res) => {
    console.log('404 hit for:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Log available routes
    console.log('Available routes:');
    app._router.stack.forEach(r => {
        if (r.route && r.route.path) {
            console.log(r.route.path);
        }
    });
});