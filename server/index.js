const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Database connection
const dbPath = path.join(__dirname, '../database/payroll.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to SQLite database');
});

// API Routes

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.get(sql, [username, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        // In a real app, use JWT. For now, sending user info.
        res.json({ user: { id: user.id, username: user.username, role: user.role } });
    });
});

// Get all employees
app.get('/api/employees', (req, res) => {
    const sql = "SELECT * FROM employees";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add employee
app.post('/api/employees', (req, res) => {
    const { first_name, last_name, email, position, salary, date_hired } = req.body;
    const sql = "INSERT INTO employees (first_name, last_name, email, position, salary, date_hired) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(sql, [first_name, last_name, email, position, salary, date_hired], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Employee added successfully" });
    });
});

// Get payrolls
app.get('/api/payrolls', (req, res) => {
    const sql = `
        SELECT p.*, e.first_name, e.last_name 
        FROM payrolls p 
        JOIN employees e ON p.employee_id = e.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add payroll
app.post('/api/payrolls', (req, res) => {
    const { employee_id, salary, pay_date } = req.body;
    const sql = "INSERT INTO payrolls (employee_id, salary, pay_date, status) VALUES (?, ?, ?, 'paid')";
    db.run(sql, [employee_id, salary, pay_date], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Payroll processed successfully" });
    });
});

// Catch-all route to serve index.html for client-side routing
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
