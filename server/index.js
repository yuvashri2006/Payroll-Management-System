const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const path = require('path');
const os = require('os');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/payrolls', require('./routes/payrollRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Health Check & Live Status
app.get('/api', (req, res) => {
    res.send('<h1>🚀 Payroll Server is LIVE</h1><p>The backend is running correctly. Connect your frontend to this URL.</p>');
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'up', 
        message: 'Server is Live',
        timestamp: new Date().toISOString() 
    });
});

// Fallback route for SPA - serve index.html for non-API requests
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server (only if not in serverless environment)
if (require.main === module) {
    app.listen(PORT, () => {
        // Get local network IP
        const interfaces = os.networkInterfaces();
        let networkIP = 'localhost';
        for (const devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    networkIP = alias.address;
                    break;
                }
            }
        }

        console.log('\n================================================');
        console.log(`✅ PAYROLL BACKEND IS LIVE!`);
        console.log(`🌍 Local Access: http://localhost:${PORT}`);
        console.log(`📡 API URL: http://${networkIP}:${PORT}/api`);
        console.log('================================================\n');
    });
}

module.exports = app;
