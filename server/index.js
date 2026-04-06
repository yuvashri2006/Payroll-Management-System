require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(compression());
app.use(express.json());

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

const mongoURI = process.env.MONGODB_URI;

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = !!db.connections[0].readyState;
        console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

// Database connection middleware
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// API Routes
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/payrolls', payrollRoutes);
app.use('/reports', reportRoutes);

// Health Check & Live Status
app.get('/api/health', (req, res) => {
    res.json({ status: 'up', message: 'Server is Live' });
});

app.get('/', (req, res) => {
    res.send("we are live");
});

// Fallback route for SPA
app.use((req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return res.status(404).json({ message: "Endpoint not found" });
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

module.exports = app;
